import json
from pathlib import Path

from sales_tax_calculator import TaxRateStore, calculate_total, parse_rates, sync_rates


def test_parse_rates_valid_payload():
    payload = json.dumps(
        [{"city": "Austin", "state": "TX", "rate": 0.0825, "updated_at": "2026-02-01"}]
    ).encode()

    rates = parse_rates(payload)

    assert len(rates) == 1
    assert rates[0].city == "Austin"
    assert rates[0].state == "TX"
    assert rates[0].rate == 0.0825


def test_sync_and_lookup_round_trip(tmp_path: Path):
    source = tmp_path / "rates.json"
    source.write_text(
        json.dumps(
            [
                {"city": "Seattle", "state": "WA", "rate": 0.1035},
                {"city": "Miami", "state": "FL", "rate": 0.07},
            ]
        ),
        encoding="utf-8",
    )

    store = TaxRateStore(tmp_path / "rates_cache.json")
    store.init_store()

    updated_count = sync_rates(source.resolve().as_uri(), store)

    assert updated_count == 2
    seattle = store.get_rate("Seattle", "wa")
    assert seattle is not None
    assert seattle.rate == 0.1035


def test_calculate_total():
    tax, total = calculate_total(100.0, 0.0825)

    assert tax == 8.25
    assert total == 108.25
