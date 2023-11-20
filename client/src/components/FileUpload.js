import { useEffect, useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No File Selected");
  const [pdfHash, setPdfHash] = useState(""); // Added state for PDF hash
  const [ipfsaddress, setipfsAddress] = useState("");

  // Function to handle file submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    let resFile;
    let hash;

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: "7e60bf66f28e25420b20",
            pinata_secret_api_key:
              "9a9354c1539fdb2c875b2397b16fcb242cd4bc508b2fd98a0897e94b7bd146a3",
            "Content-Type": "multipart/form-data",
          },
        });

        if (file.name.endsWith(".pdf")) {
          hash = await generatePDFHash(file);
          setPdfHash(`PDF Hash: ${hash}`);
          console.log(hash);
        } else {
          setPdfHash("Uploaded file is not a PDF.");
          hash = "";
        }
      } catch (e) {
        alert("Unable to upload the file");
      }

      // Now you can use resFile here
      const ipfsaddress = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setipfsAddress(ipfsaddress);
      const stName = document.querySelector("#st_name").value;
      const stRoll = document.querySelector("#st_roll").value;
      const passYear = document.querySelector("#st_year").value;
      contract.add(account, stName, stRoll, passYear, ipfsaddress, hash);
      console.log(stName, stRoll, passYear, ipfsaddress, hash);
      alert("File Uploaded Successfully to IPFS");
      setFileName("No File Selected");
      setFile(null);
    }
  };

  // Function to handle file retrieval.

  const retrieveFile = async (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    setPdfHash(""); // Reset PDF hash when a new file is selected
    e.preventDefault();
  };

  // Function to generate a PDF hash.
  const generatePDFHash = async (pdfFile) => {
    try {
      const pdfBuffer = await readFileAsArrayBuffer(pdfFile);
      const hashBuffer = await crypto.subtle.digest("SHA-256", pdfBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch (error) {
      console.error(error);
      return "Error generating hash";
    }
  };

  // Function to fetch a diploma from the blockchain.
  const getDiploma = async (e) => {
    e.preventDefault();
    try {
      const sname = document.querySelector("#studentName").value;
      const sRoll = document.querySelector("#rollNumber").value;
      const sPassYear = document.querySelector("#passingYear").value;

      const result = await contract.getDocumentByStudent(
        sname,
        sRoll,
        sPassYear
      );

      if (
        !result ||
        result.length === 0 ||
        result[0] === "" ||
        result[0] === "0x"
      ) {
        console.log(`${sname} is not registered.`);
        alert(`${sname} is not registered in blockchain.`);
      } else {
        const url = result[0]; // Access the URL
        const fileHash = result[1]; // Access the hash
        console.log(
          `This is ${sname}'s diploma with URL: ${url} and its hash: ${fileHash}`
        );
        alert(
          `This is ${sname}'s diploma with URL: ${url} and its hash: ${fileHash}`
        );
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      alert("Error fetching document.");
    }
  };

  // Component return statement with JSX.
  return (
    <div className="container">
      <div className="top">
        <p className="formTitle">Fill the forms and Upload your Diploma</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="studentdetails">
            <input
              type="text"
              className="input-field"
              placeholder="Student Name"
              id="st_name"
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="Roll Number"
              id="st_roll"
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="Passing year"
              id="st_year"
              required
            />
          </div>
          <label htmlFor="file-upload" className="choose">
            Upload Diploma
          </label>
          <input
            disabled={!account}
            type="file"
            id="file-upload"
            name="data"
            onChange={retrieveFile}
          ></input>
          <span className="text-aread">{fileName} </span>
          <button className="upload" type="submit" disabled={!file}>
            Upload
          </button>
          <br></br>
        </form>
      </div>

      <div className="getDocument">
        <p className="formTitle">Get Diploma</p>
        <form onSubmit={getDiploma}>
          <div className="form-group">
            <input
              type="text"
              id="studentName"
              placeholder="Student Name"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              id="rollNumber"
              placeholder="Roll Number"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              id="passingYear"
              placeholder="Passing Year"
              required
            />
          </div>
          <button type="submit">Generate URL and Hash</button>
        </form>
      </div>
    </div>
  );
};
export default FileUpload;
