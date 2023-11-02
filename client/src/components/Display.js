import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
  const getdata = async () => {
    let dataArray;
    const otheraddress = document.querySelector(".address").value;
    try {
      if (otheraddress) {
        dataArray = await contract.display(otheraddress);
        console.log(dataArray);
      } else {
        dataArray = await contract.display(account);
      }

      const isEmpty = Object.keys(dataArray).length === 0;
      if (!isEmpty) {
        const str = dataArray.toString();
        const str_array = str.split(",");
        const images = str_array.map((item, i) => {
          return (
            <a href={item} key={i} target="_blank">
              <img
                key={i}
                src={`https://gateway.pinata.cloud/ipfs/${item.substring(6)}`}
                alt="New"
                className="image-list"
              ></img>
            </a>
          );
        });
        setData(images);
      } else {
        alert("No image is selected");
      }
    } catch (e) {
      // console.error(e);
      alert("You Don't have access please contact the owner");
    }
  };
  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
      ></input>
      <button className="center button" onClick={getdata}>
        Get Data
      </button>
    </>
  );
};
export default Display;
