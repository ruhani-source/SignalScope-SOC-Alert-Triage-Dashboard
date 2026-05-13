export const alerts = [
  {
    id: 1,
    user: "alice@company.com",
    location: "Russia",
    device: "Unknown",
    risk: 85,
    signals: {
      new_country: true,
      impossible_travel: true,
      new_device: true,
      vpn_suspected: true,
      mfa_used: false
    },
    timeline: [
      { time: "08:00", event: "Login", location: "Canada", device: "MacBook" },
      { time: "10:00", event: "Login", location: "Russia", device: "Unknown" }
    ]
  }
];