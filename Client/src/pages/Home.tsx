import ReceiptScanner from "../components/ReceiptScanner";

const Home: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1>SmartKitchen</h1>
      <p>Scan your receipts to manage your kitchen inventory</p>
      <ReceiptScanner />
    </div>
  );
};

export default Home;
