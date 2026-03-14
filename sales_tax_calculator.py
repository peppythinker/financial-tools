#!/usr/bin/env python3
"""Sales tax calculator with syncable city rates (no database required)."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_RATES_PATH = Path("data/tax_rates.json")


@dataclass
class TaxRate:
    city: str
    state: str
    rate: float
    updated_at: str | None = None


class TaxRateStore:
    """File-backed store for tax rates.

    Uses a local JSON file so users do not need to run a database.
    """

    def __init__(self, rates_path: Path = DEFAULT_RATES_PATH) -> None:
        self.rates_path = rates_path
        self.rates_path.parent.mkdir(parents=True, exist_ok=True)

    def init_store(self) -> None:
        if not self.rates_path.exists():
            self.rates_path.write_text("[]", encoding="utf-8")

    def _read_rates(self) -> list[TaxRate]:
        self.init_store()
        raw = json.loads(self.rates_path.read_text(encoding="utf-8"))
        return [
            TaxRate(
                city=str(item["city"]),
                state=str(item["state"]),
                rate=float(item["rate"]),
                updated_at=str(item["updated_at"]) if item.get("updated_at") else None,
            )
            for item in raw
        ]

    def _write_rates(self, rates: Iterable[TaxRate]) -> None:
        payload = [asdict(rate) for rate in rates]
        self.rates_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def upsert_rates(self, rates: Iterable[TaxRate]) -> int:
        existing = {
            (rate.city.strip().lower(), rate.state.strip().upper()): rate
            for rate in self._read_rates()
        }

        count = 0
        for rate in rates:
            normalized = TaxRate(
                city=rate.city.strip().lower(),
                state=rate.state.strip().upper(),
                rate=rate.rate,
                updated_at=rate.updated_at,
            )
            existing[(normalized.city, normalized.state)] = normalized
            count += 1

        self._write_rates(existing.values())
        return count

    def get_rate(self, city: str, state: str) -> TaxRate | None:
        lookup_city = city.strip().lower()
        lookup_state = state.strip().upper()
        for rate in self._read_rates():
            if rate.city == lookup_city and rate.state == lookup_state:
                return rate
        return None

    def list_rates(self) -> list[TaxRate]:
        return sorted(self._read_rates(), key=lambda item: (item.state, item.city))


def parse_rates(raw_data: bytes) -> list[TaxRate]:
    decoded = json.loads(raw_data)
    if not isinstance(decoded, list):
        raise ValueError("Rate source must be a JSON array")

    rates: list[TaxRate] = []
    for item in decoded:
        if not isinstance(item, dict):
            raise ValueError("Each item in rate source must be an object")

        rates.append(
            TaxRate(
                city=str(item["city"]),
                state=str(item["state"]),
                rate=float(item["rate"]),
                updated_at=str(item["updated_at"]) if "updated_at" in item else None,
            )
        )

    return rates


def sync_rates(source_url: str, store: TaxRateStore) -> int:
    with urllib.request.urlopen(source_url) as response:
        body = response.read()

    rates = parse_rates(body)
    return store.upsert_rates(rates)


def calculate_total(subtotal: float, tax_rate: float) -> tuple[float, float]:
    tax_amount = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax_amount, 2)
    return tax_amount, total


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Sales tax calculator that syncs city rates from remote JSON sources."
    )
    parser.add_argument(
        "--rates-file",
        default=str(DEFAULT_RATES_PATH),
        help="Path to local JSON cache file (default: data/tax_rates.json)",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    sync_parser = subparsers.add_parser("sync", help="Sync city sales tax rates from URL")
    sync_parser.add_argument("source", help="JSON URL (https://... or file:///...)")

    calc_parser = subparsers.add_parser("calculate", help="Calculate tax + total for a city")
    calc_parser.add_argument("city", help="City name")
    calc_parser.add_argument("state", help="State code")
    calc_parser.add_argument("subtotal", type=float, help="Subtotal amount")

    subparsers.add_parser("list", help="List all synced tax rates")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    store = TaxRateStore(Path(args.rates_file))
    store.init_store()

    if args.command == "sync":
        updated = sync_rates(args.source, store)
        print(f"Synced {updated} tax rate record(s) from {args.source}")
        return 0

    if args.command == "calculate":
        rate = store.get_rate(args.city, args.state)
        if rate is None:
            print(
                f"No tax rate found for {args.city}, {args.state}. Run the sync command first.",
                file=sys.stderr,
            )
            return 1

        tax_amount, total = calculate_total(args.subtotal, rate.rate)
        print(f"Location: {rate.city.title()}, {rate.state}")
        print(f"Rate: {rate.rate:.4f} ({rate.rate * 100:.2f}%)")
        print(f"Subtotal: ${args.subtotal:.2f}")
        print(f"Tax: ${tax_amount:.2f}")
        print(f"Total: ${total:.2f}")
        return 0

    if args.command == "list":
        rates = store.list_rates()
        if not rates:
            print("No tax rates available. Run the sync command first.")
            return 0

        for rate in rates:
            updated_suffix = f" | updated_at={rate.updated_at}" if rate.updated_at else ""
            print(
                f"{rate.city.title()}, {rate.state}: {rate.rate:.4f} ({rate.rate * 100:.2f}%)"
                f"{updated_suffix}"
            )
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
