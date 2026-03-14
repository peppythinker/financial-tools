-# financial-tools
-useful financial tools
+# Financial Tools
+
+## Sales Tax Calculator
+
+This repository includes `sales_tax_calculator.py`, a CLI that can **sync city sales tax rates from an external JSON source** and calculate totals without hardcoding rates.
+
+> You do **not** need a database server. Rates are cached in a local JSON file by default.
+
+### Features
+
+- Sync tax rates from any reachable JSON URL (`https://...` or `file:///...`)
+- Store rates in a local JSON cache (`data/tax_rates.json` by default)
+- Calculate tax + total by city/state
+- List all synced rates
+
+### Expected source format
+
+```json
+[
+  {"city": "New York", "state": "NY", "rate": 0.08875, "updated_at": "2026-01-01"},
+  {"city": "Chicago", "state": "IL", "rate": 0.1025}
+]
+```
+
+### Usage
+
+```bash
+# 1) Sync rates from a local file sample
+python3 sales_tax_calculator.py sync file:///workspace/financial-tools/examples/city_tax_rates.json
+
+# 2) Calculate total for a location
+python3 sales_tax_calculator.py calculate "New York" NY 149.99
+
+# 3) See all stored rates
+python3 sales_tax_calculator.py list
+```
+
+### Run tests
+
+```bash
+python3 -m pytest -q
+```
 
EOF
)
