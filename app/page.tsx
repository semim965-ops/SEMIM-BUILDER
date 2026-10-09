
"use client";

import { useMemo, useState } from "react";

type WorkItem = {
  id: number;
  name: string;
  unit: "m³" | "m²" | "kg";
  nos: number;
  length: number;
  breadth: number;
  height: number;
  quantity: number;
  rate: number;
};

const initialItems: WorkItem[] = [
  { id: 1, name: "Earthwork excavation", unit: "m³", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 2, name: "PCC foundation", unit: "m³", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 3, name: "RCC concrete", unit: "m³", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 4, name: "Reinforcement steel (BBS)", unit: "kg", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 5, name: "Brickwork", unit: "m³", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 6, name: "Plastering", unit: "m²", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 7, name: "Flooring", unit: "m²", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
  { id: 8, name: "Painting", unit: "m²", nos: 0, length: 0, breadth: 0, height: 0, quantity: 0, rate: 0 },
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
  const [floors, setFloors] = useState(1);
  const [items, setItems] = useState<WorkItem[]>(initialItems);
  const [message, setMessage] = useState("");

  function updateItem(
    id: number,
    field: keyof WorkItem,
    value: string
  ) {
    const numericFields: (keyof WorkItem)[] = [
      "nos", "length", "breadth", "height", "quantity", "rate",
    ];

    const safeValue = numericFields.includes(field)
      ? Math.max(0, Number(value) || 0)
      : value;

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: safeValue }
          : item
      )
    );
    setMessage("");
  }

  function calculateQuantities() {
    setItems((current) =>
      current.map((item) => {
        // Steel quantity must come from a bar bending schedule.
        if (item.id === 4) return item;

        const n = item.nos;
        const l = item.length;
        const b = item.breadth;
        const h = item.height;

        let quantity = 0;

        if ([1, 2, 3, 5].includes(item.id)) {
          // Excavation, PCC, RCC and brickwork: volume.
          quantity = n * l * b * h;
        } else if (item.id === 6 || item.id === 8) {
          // Plastering and painting: measured surface area.
          quantity = n * l * h;
        } else if (item.id === 7) {
          // Flooring: plan area.
          quantity = n * l * b;
        }

        return {
          ...item,
          quantity: Number(quantity.toFixed(3)),
        };
      })
    );

    setMessage(
      "Measured quantities calculated. Check every dimension and deduction before using this BOQ."
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

  const [overhead, setOverhead] = useState(5);
  const [profit, setProfit] = useState(10);

  const overheadAmount = subtotal * overhead / 100;
  const profitAmount = (subtotal + overheadAmount) * profit / 100;
  const total = subtotal + overheadAmount + profitAmount;

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">CIVIL CONSTRUCTION ESTIMATOR</p>
          <h1>SEMIM BUILDER</h1>
          <p className="muted">
            Building measurement, quantity calculation and BOQ
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
            <input value={client}
              onChange={(e) => setClient(e.target.value)} />
          </label>
          <label>
            Site location
            <input value={site}
              onChange={(e) => setSite(e.target.value)} />
          </label>
          <label>
            Building type
            <input value="RCC framed building" readOnly />
          </label>
          <label>
            Number of floors
            <input type="number" min="1" step="1"
              value={floors}
              onChange={(e) =>
                setFloors(Math.max(1, Math.floor(Number(e.target.value) || 1)))
              } />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Detailed measurement sheet</h2>
        <p className="muted">
          Enter the number of identical items and their dimensions in metres.
          Use drawing measurements. Enter actual measured dimensions rather
          than estimated building-wide allowances.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Work item</th>
                <th>Unit</th>
                <th>No.</th>
                <th>Length (m)</th>
                <th>Breadth (m)</th>
                <th>Height / thickness (m)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.unit}</td>
                  {(["nos", "length", "breadth", "height"] as const).map(
                    (field) => (
                      <td key={field}>
                        <input
                          aria-label={`${item.name} ${field}`}
                          type="number"
                          min="0"
                          step="any"
                          value={item[field]}
                          disabled={item.id === 4}
                          onChange={(e) =>
                            updateItem(item.id, field, e.target.value)
                          }
                        />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="muted">
          For wall items, use the measured wall length and height. For volume
          items, enter the actual breadth or thickness in metres.
        </p>

        <button type="button" onClick={calculateQuantities}>
          Calculate measured quantities
        </button>

        {message && (
          <p role="status" aria-live="polite" className="status-message">
            {message}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Bill of Quantities (BOQ)</h2>
        <p className="muted">
          Enter the applicable rate for each item. Steel quantity must be
          entered from a verified BBS.
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
                        updateItem(item.id, "quantity", e.target.value)
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
                        updateItem(item.id, "rate", e.target.value)
                      }
                    />
                  </td>
                  <td>{money(item.quantity * item.rate)}</td>
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
            <input type="number" min="0" step="any"
              value={overhead}
              onChange={(e) =>
                setOverhead(Math.max(0, Number(e.target.value) || 0))
              } />
          </label>
          <label>
            Contractor profit (%)
            <input type="number" min="0" step="any"
              value={profit}
              onChange={(e) =>
                setProfit(Math.max(0, Number(e.target.value) || 0))
              } />
          </label>
        </div>

        <div className="total-row">
          <span>BOQ subtotal</span><strong>{money(subtotal)}</strong>
        </div>
        <div className="total-row">
          <span>Overheads</span><strong>{money(overheadAmount)}</strong>
        </div>
        <div className="total-row">
          <span>Contractor profit</span><strong>{money(profitAmount)}</strong>
        </div>
        <div className="grand-total">
          <span>Estimated total</span><strong>{money(total)}</strong>
        </div>
        <p className="muted">
          This version calculates basic measured quantities only. Deduct
          openings, avoid double-counting, and verify the measurement method
          against the drawings and applicable specifications before quoting.
        </p>
      </section>

      <footer>SEMIM BUILDER · Building Estimation Software</footer>
    </main>
  );
}
