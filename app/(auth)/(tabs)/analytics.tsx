import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import database from "@react-native-firebase/database";
import { LineChart } from "react-native-gifted-charts";

export default function AnalyticsScreen() {
  const [sensorType, setSensorType] = useState("ph");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [openSensor, setOpenSensor] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);

  const [dataPoints, setDataPoints] = useState<{ value: number; label: string }[]>([]);

  const SENSOR_TYPES = [
    { label: "pH", value: "ph" },
    { label: "Temperature", value: "temperature" },
    { label: "TDS", value: "tds" },
  ];

  const MONTHS = [
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  const YEARS = [
    { label: "2023", value: 2023 },
    { label: "2024", value: 2024 },
    { label: "2025", value: 2025 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
      console.log("Fetching data for:", sensorType, "Year:", year, "Month:", month);
  
      database()
        .ref(`sensors/${sensorType}`)
        .on(
          "value",
          (snapshot) => {
            const rawData = snapshot.val();
            console.log("Raw data:", rawData); // Debugging
  
            const dailyData: Record<number, number[]> = {};
  
            if (rawData) {
              Object.keys(rawData).forEach((timestamp) => {
                const date = new Date(timestamp); // Parse ISO 8601 string
                const entryYear = date.getFullYear();
                const entryMonth = date.getMonth();
                const entryDay = date.getDate();
  
                // Filter by selected year and month
                if (entryYear === year && entryMonth === month) {
                  if (!dailyData[entryDay]) {
                    dailyData[entryDay] = [];
                  }
                  dailyData[entryDay].push(parseFloat(rawData[timestamp]));
                }
              });
            }
  
            // Compute daily averages and prepare chart data
            const chartData = [];
            for (let day = 1; day <= daysInMonth; day++) {
              const values = dailyData[day] || [];
              const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
              chartData.push({ value: average, label: day.toString() });
            }
  
            console.log("Chart data:", chartData); // Debugging
            setDataPoints(chartData);
          },
          (error) => {
            console.error("Error fetching data:", error);
          }
        );
    };
  
    fetchData();
  }, [sensorType, month, year]);
  

  return (
    <View style={styles.container}>
      {/* Filters Section */}
      <View style={[styles.filterContainer, styles.shadow]}>
        <Text style={styles.title}>Filters</Text>
        <DropDownPicker
          open={openSensor}
          value={sensorType}
          items={SENSOR_TYPES}
          setOpen={setOpenSensor}
          setValue={setSensorType}
          placeholder="Sensor Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContent}
          zIndex={4000}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <DropDownPicker
              open={openMonth}
              value={month}
              items={MONTHS}
              setOpen={setOpenMonth}
              setValue={setMonth}
              placeholder="Month"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContent}
              zIndex={3000}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <DropDownPicker
              open={openYear}
              value={year}
              items={YEARS}
              setOpen={setOpenYear}
              setValue={setYear}
              placeholder="Year"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContent}
              zIndex={3000}
            />
          </View>
        </View>
      </View>

      {/* Chart Section */}
      <View style={[styles.chartContainer, styles.shadow]}>
        <Text style={styles.title}>Chart</Text>
        {dataPoints.length > 0 ? (
          <ScrollView horizontal>
            <LineChart
              data={dataPoints}
              width={Math.max(600, dataPoints.length * 40)} // Adjust width for scrolling
              height={220}
              isAnimated
              showVerticalLines
              hideDataPoints={false} // Show data points
              dataPointsShape="circle"
              dataPointsRadius={4}
              dataPointsColor="#3A8DFF"
              spacing={40}
              adjustToWidth
              xAxisLabelTextStyle={{ color: "#999", fontSize: 10 }}
              yAxisTextStyle={{ color: "#999", fontSize: 10 }}
              xAxisThickness={1}
              yAxisThickness={1}
              areaChart
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>
            No data available for the selected filters.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    zIndex: 2000,
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    zIndex: 1000,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  dropdownContent: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EDEDED",
    borderWidth: 1,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});
