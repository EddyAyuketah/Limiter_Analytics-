useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await fetchCeidData();  // ← uses the txt file
          setCeidData(data);
        } catch (error) {
          console.error("Error loading CEID data:", error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    
      const intervalId = setInterval(fetchData, 2 * 60 * 60 * 1000); // every 2 hrs
      return () => clearInterval(intervalId);
    }, []);
