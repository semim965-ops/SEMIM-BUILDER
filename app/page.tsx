
"use client";

import { useMemo, useState } from "react";

type Item = {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
};

const initialItems: Item[] = [
  { id: 1, name: "Earthwork excavation", unit: "m³", quantity: 0, rate: 0 },
  { id: 2, name: "PCC foundation", unit: "m³", quantity: 0, rate: 0 },
  { id: 3, name: "RCC concrete", unit: "m³", quantity: 0, rate: 0 },
  { id: 4, name: "Reinforcement steel", unit: "kg", quantity: 0, rate: 0 },
  { id: 5, name: "Brickwork", unit: "m³", quantity: 0, rate: 0 },
  { id: 6, name: "Plastering", unit: "m²", quantity: 0, rate: 0 },
  { id: 7, name: "Flooring", unit: "m²", quantity: 0, rate: 0 },
  { id: 8, name: "Painting", unit: "m²", quantity: 0, rate: 0 },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function Home() {
  const [client, setClient] = useState("SEMIM BUILDER");
  const [site, setSite] = useState("Guwahati, Assam");
  const [buildingType, setBuildingType] = useState("RCC framed building");
  const [floors, setFloors] = useState(1);

  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(3);

  const [overhead, setOverhead] = useState(5);
  const [profit, setProfit] = useState(10);
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<Item[]>(initialItems);

  const area = length * width * floors;
  const perimeter = 2 * (length + width);

  function updateItem(
    id: number,
    field: "quantity" | "rate",
    value: number
  ) {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: safeValue } : item
      )
    );
  }

  function applyBasicMeasurements() {
    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      length <= 0 ||
      width <= 0 ||
      height <= 0 ||
      floors < 1
    ) {
      setMessage(
        "Please enter a length, width and floor height greater than zero."
      );
      return;
    }

    const floorArea = length * width * floors;

    setItems((current) =>
      current.map((item) => {
        switch (item.id) {
          case 3:
            // Demonstration allowance only, not drawing-based RCC.
            return {
              ...item,
              quantity: Number((floorArea * 0.15).toFixed(3)),
            };

          case 5:
            // Simplified perimeter-wall allowance.
            return {
              ...item,
              quantity: Number(
                (perimeter * height * floors * 0.23).toFixed(3)
              ),
            };

          case 6:
            // Gross perimeter wall area; openings are not deducted.
            return {
              ...item,
              quantity: Number(
                (perimeter * height * floors).toFixed(3)
              ),
            };

          case 7:
            return {
              ...item,
              quantity: Number(floorArea.toFixed(3)),
            };

          case 8:
            // Not a verified painting quantity.
            return {
              ...item,
              quantity: Number(floorArea.toFixed(3)),
            };

          default:
            return item;
        }
      })
    );

    setMessage(
      "Preliminary quantities updated. Review the BOQ below."
    );
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0
      ),
    [items]
  );

  const overheadAmount = (subtotal * overhead) / 100;
  const profitAmount =
    ((subtotal + overheadAmount) * profit) / 100;
  const total = subtotal + overheadAmount + profitAmount;

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">CIVIL CONSTRUCTION ESTIMATOR</p>
          <h1>SEMIM BUILDER</h1>
          <p className="muted">
            Building estimation and BOQ management
          </p>
        </div>

        <button type="button" onClick={() => window.print()}>
          Print estimate
        </button>
      </header>

      <section className="panel">
        <h2>Project details</h2>

        <div className="form-grid">
          <label>
            Client / contractor
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </label>

          <label>
            Site location
            <input
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          </label>

          <label>
            Building type
            <input
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
            />
          </label>

          <label>
            Number of floors
            <input
              type="number"
              min="1"
              step="1"
              value={floors}
              onChange={(e) =>
                setFloors(
                  Math.max(1, Math.floor(Number(e.target.value) || 1))
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Building measurements</h2>

        <p className="muted">
          Enter external building dimensions in metres. Some quantities
          below are demonstration allowances, not drawing-verified
          measurements.
        </p>

        <div className="form-grid">
          <label>
            Length (m)
            <input
              type="number"
              min="0"
              step="any"
              value={length}
              onChange={(e) =>
                setLength(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>

          <label>
            Width (m)
            <input
              type="number"
              min="0"
              step="any"
              value={width}
              onChange={(e) =>
                setWidth(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>

          <label>
            Floor height (m)
            <input
              type="number"
              min="0"
              step="any"
              value={height}
              onChange={(e) =>
                setHeight(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>
        </div>

        <div className="summary-strip">
          <span>Floor area</span>
          <strong>{area.toFixed(2)} m²</strong>

          <button
            type="button"
            onClick={applyBasicMeasurements}
          >
            Apply preliminary quantities
          </button>
        </div>

        {message && (
          <p role="status" aria-live="polite" className="status-message">
            {message}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Bill of Quantities (BOQ)</h2>

        <p className="muted">
          Enter or verify each quantity and local rate. Amounts update
          automatically. All rates are in Indian rupees.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Work description</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Rate (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.unit}</td>

                  <td>
                    <input
                      aria-label={`${item.name} quantity`}
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      aria-label={`${item.name} rate`}
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "rate",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>
                    {money(item.quantity * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel totals">
        <h2>Cost summary</h2>

        <div className="form-grid">
          <label>
            Overheads (%)
            <input
              type="number"
              min="0"
              step="any"
              value={overhead}
              onChange={(e) =>
                setOverhead(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>

          <label>
            Contractor profit (%)
            <input
              type="number"
              min="0"
              step="any"
              value={profit}
              onChange={(e) =>
                setProfit(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>
        </div>

        <div className="total-row">
          <span>BOQ subtotal</span>
          <strong>{money(subtotal)}</strong>
        </div>

        <div className="total-row">
          <span>Overheads</span>
          <strong>{money(overheadAmount)}</strong>
        </div>

        <div className="total-row">
          <span>Contractor profit</span>
          <strong>{money(profitAmount)}</strong>
        </div>

        <div className="grand-total">
          <span>Estimated total</span>
          <strong>{money(total)}</strong>
        </div>

        <p className="muted">
          Preliminary estimate only. Confirm drawing-based quantities,
          specifications, local rates, applicable taxes and exclusions
          before issuing a client quotation.
        </p>
      </section>

      <footer>
        SEMIM BUILDER · Building Estimation Software
      </footer>
    </main>
  );
}
