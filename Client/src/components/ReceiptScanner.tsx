import { useState, ChangeEvent } from "react";
import axios from "axios";

interface ParsedProduct {
  name: string;
  sizeValue: number;
  sizeUnit: string;
}

const ReceiptScanner = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    setProducts([]);
    setError(null);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3000/receipt-scanner/scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts(response.data);
    } catch (err) {
      console.error("Error during file upload:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "600px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Receipt Scanner</h2>

      <div style={{ margin: "20px 0" }}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          id="receipt-file"
        />
      </div>

      {previewUrl && (
        <div style={{ textAlign: "center", margin: "15px 0" }}>
          <img
            src={previewUrl}
            alt="Receipt preview"
            style={{ maxHeight: "300px", maxWidth: "100%" }}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        style={{ width: "100%", padding: "10px", margin: "20px 0" }}
      >
        {isLoading ? "Scanning..." : "Scan Receipt"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            margin: "15px 0",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}
        >
          Error: {error}
        </div>
      )}

      {products.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Scanned Products:</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    color: "#333",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    color: "#333",
                  }}
                >
                  Size
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    color: "#333",
                  }}
                >
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {product.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {product.sizeValue}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {product.sizeUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
