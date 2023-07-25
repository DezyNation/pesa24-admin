import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "row",
    backgroundColor: "#525FE1",
    color: "#FFF",
    padding: 5
  },
  cell: {
    flex: 1,
    padding: 5,
  },
});

const PdfDocument = ({ rowData, columnDefs }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.column}>
        {columnDefs
          .filter((column) => {
            if (
              column.field != "metadata" &&
              column.field != "name" &&
              column.field != "receipt"
            ) {
              return column;
            }
          })
          .map((column, key) => {
            return (
              <View style={styles.cell} key={key}>
                <Text>{column?.headerName}</Text>
              </View>
            );
          })}
      </View>
      <View style={styles.container}>
        {rowData.map((data, key) => (
          <View style={styles.container} key={key}>
            <View style={styles.cell}>
              <Text>{key + 1}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.transaction_id}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.debit_amount}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.credit_amount}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.opening_balance}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.closing_balance}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.transaction_for}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.service_type}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{JSON.parse(data.metadata).status}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.created_at}</Text>
            </View>
            <View style={styles.cell}>
              <Text>{data.updated_at}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
