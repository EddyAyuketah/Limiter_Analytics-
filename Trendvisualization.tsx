  const [selectedCeids, setSelectedCeids] = useState(() => {
    try {
      const stored = localStorage.getItem('trend_ceids');
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
