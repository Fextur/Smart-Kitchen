import { useState, ChangeEvent } from "react";
import axios from "axios";
import { Button, IconButton, MenuItem, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { SizeUnit } from "../types";
import {
  DesktopDatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface ParsedProduct {
  name: string;
  sizeValue: number;
  sizeUnit: string;
  expirationDate: Date | null;
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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | { value: any }>,
    index: number,
    field: keyof ParsedProduct
  ): void => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: event.target.value,
    };
    setProducts(newProducts);
  };

  const handleDateChange = (date: Date | null, index: number): void => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      expirationDate: date,
    };
    setProducts(newProducts);
  };

  const handleDelete = (index: number): void => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
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
        `${import.meta.env.VITE_API_URL}/receipt-scanner/scan`,
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

  const createProducts = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/products`, {
      products: products,
      userId: "5f6d36a1-e883-4e27-9f3a-c6c5e8a7b2d9", //TODO:change 
    });
  };

  return (
    <div
      style={{
        width: "90%",
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
          <div style={{ display: "grid", gap: "16px" }}>
            {products.map((product, index) => (
              <div
                key={product.name}
                style={{
                  display: "grid",
                  gap: "5%",
                  gridTemplateColumns: "1fr 4fr 4fr 2fr 1fr",
                }}
              >
                <IconButton onClick={() => handleDelete(index)}>
                  <DeleteIcon color="error" />
                </IconButton>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    label="תאריך תפוגה"
                    value={product.expirationDate}
                    onChange={(date) => handleDateChange(date, index)}
                  />
                </LocalizationProvider>

                <TextField
                  label="שם המוצר"
                  variant="standard"
                  value={product.name}
                  style={{ gridColumn: "span 1", direction: "rtl" }}
                  onChange={(e) => handleChange(e, index, "name")}
                  slotProps={{
                    inputLabel: {
                      style: {
                        right: -10,
                        left: "unset",
                      },
                    },
                  }}
                />

                <TextField
                  label="יח מידה"
                  select
                  variant="standard"
                  value={product.sizeUnit}
                  defaultValue={product.sizeUnit}
                  style={{ gridColumn: "span 1", direction: "rtl" }}
                  onChange={(e) => handleChange(e, index, "sizeUnit")}
                  slotProps={{
                    inputLabel: {
                      style: {
                        right: -10,
                        left: "unset",
                      },
                    },
                  }}
                >
                  {Object.values(SizeUnit).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="משקל"
                  variant="standard"
                  value={product.sizeValue}
                  style={{ gridColumn: "span 1", direction: "rtl" }}
                  onChange={(e) => handleChange(e, index, "sizeValue")}
                  slotProps={{
                    inputLabel: {
                      style: {
                        right: -10,
                        left: "unset",
                      },
                    },
                  }}
                />
              </div>
            ))}
          </div>
          <Button sx={{ marginTop: 4 }} onClick={createProducts}>
            תעדכן את המטבח שלי
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
