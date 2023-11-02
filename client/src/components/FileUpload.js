import { useState } from "react";
// import { Link } from "react-router-dom";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No File Selected");
  const [pdfHash, setPdfHash] = useState(""); // Added state for PDF hash
  const [image_hash, setImage_hash] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let resFile; // Declare resFile here

    if (file) {
      try {
        // ... (Your existing code for uploading the file)
        const formData = new FormData();
        formData.append("file", file);
        resFile = await axios({
          // Assign the response to resFile
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

        // After uploading the file, calculate the PDF hash
        if (file.name.endsWith(".pdf")) {
          // Check if the uploaded file is a PDF
          const hash = await generatePDFHash(file);
          setPdfHash(`PDF Hash: ${hash}`);
        } else {
          setPdfHash("Uploaded file is not a PDF.");
        }

        // ... (The rest of your code)
      } catch (e) {
        alert("Unable to upload the file");
      }

      // Now you can use resFile here
      const imageHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setImage_hash(imageHash);
      const stName = document.querySelector("#st_name").value;
      const stRoll = document.querySelector("#st_roll").value;
      const passYear = document.querySelector("#st_year").value;
      contract.add(account, stName, stRoll, passYear, imageHash, pdfHash);
      console.log(stName, stRoll, passYear, imageHash, pdfHash);
      alert("File Uploaded Successfully to IPFS");
      setFileName("No File Selected");
      setFile(null);
    }
  };

  // Existing code for retrieving the uploaded file

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

  // Function to generate PDF hash
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

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  {
    /* Get Docuemnt Hash and Diploma Smart Contract Code  */
  }

  const getDiploma = async (e) => {
    e.preventDefault();
    const sname = document.querySelector("#studentName").value;
    const sRoll = document.querySelector("#rollNumber").value;
    const sPassYear = document.querySelector("#passingYear").value;

    const result = await contract.getDocumentByStudent(sname, sRoll, sPassYear);
    const url = result[0]; // Access the URL
    const fileHash = result[1]; // Access the hash

    console.log("URL:", url);
    console.log("File Hash:", fileHash);
  };

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
          <div className="urlhash">
            {pdfHash && <p className="hash">{pdfHash}</p>}{" "}
            {/* Display the PDF hash if available */}
            {image_hash && (
              <p className="ipfs">
                Document IPFS Address:
                <a href={image_hash} target="_blank">
                  Click to Open the file
                </a>
              </p>
            )}{" "}
          </div>
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
