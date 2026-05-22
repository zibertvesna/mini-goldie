"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

/* HOURS */
const times = Array.from({ length: 33 }, (_, i) => {
  const hour = 6 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

/* SERVICES */
const services = [
  { name: "Striženje", price: 30, color: "#ff4da6" },
  { name: "Barvanje", price: 60, color: "#7c4dff" },
  { name: "Manikura", price: 40, color: "#00c2ff" },
];

export default function Home() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [name, setName] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [service, setService] = useState<any>(null);

  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [unlocked]);

  const login = () => {
    if (pin === PIN) setUnlocked(true);
  };

  const book = async () => {
    if (!name || !time || !service) return;

    await addDoc(collection(db, "appointments"), {
      name,
      time,
      date: new Date().toDateString(),
      service: service.name,
      price: service.price,
      color: service.color,
    });

    setName("");
    setTime(null);
    setService(null);
  };

  const revenueToday = appointments.reduce(
    (sum, a) => sum + (a.price || 0),
    0
  );

  return (
    <div style={styles.screen}>

      {/* LEFT TIMELINE */}
      <div style={styles.timeline}>

        <h2 style={{ marginBottom: 10 }}>📅 Danes</h2>

        {times.map(t => {
          const booking = appointments.find(a => a.time === t);

          return (
            <div
              key={t}
              onClick={() => setTime(t)}
              style={{
                ...styles.row,
                background: booking ? booking.color : "#f7f7f7",
              }}
            >
              <div style={styles.hour}>{t}</div>

              <div style={styles.content}>
                {booking ? booking.name + " • " + booking.service : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT DASHBOARD */}
      <div style={styles.dashboard}>

        <h2>💅 Goldie Pro</h2>

        <div style={styles.card}>
          💰 Danes: {revenueToday} €
        </div>

        <div style={styles.card}>
          📊 Bookings: {appointments.length}
        </div>

        <h3>➕ Quick add</h3>

        <input
          placeholder="Ime stranke"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <div style={styles.services}>
          {services.map(s => (
            <button
              key={s.name}
              onClick={() => setService(s)}
              style={{
                ...styles.serviceBtn,
                background: service?.name === s.name ? s.color : "#eee",
                color: service?.name === s.name ? "#fff" : "#000",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        <button onClick={book} style={styles.save}>
          Shrani booking ({time || "izberi uro"})
        </button>

      </div>

    </div>
  );
}

/* STYLES */
const styles: any = {
  screen: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial",
    background: "#fff",
  },

  timeline: {
    flex: 2,
    padding: 20,
    borderRight: "1px solid #eee",
  },

  dashboard: {
    flex: 1,
    padding: 20,
  },

  row: {
    display: "flex",
    padding: 10,
    marginBottom: 6,
    borderRadius: 10,
    cursor: "pointer",
  },

  hour: {
    width: 70,
    color: "#555",
    fontSize: 12,
  },

  content: {
    flex: 1,
    fontSize: 13,
  },

  card: {
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 10,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },

  services: {
    display: "grid",
    gap: 6,
    marginBottom: 10,
  },

  serviceBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10,
  },

  save: {
    width: "100%",
    padding: 12,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },
};