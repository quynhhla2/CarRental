import React, { useState, useEffect } from "react";
import { web3, carRentalService } from "../contracts/CarRentalService";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import sedan from "../assets/car.png";
import suv from "../assets/SUV.jpg";
import performance from "../assets/performance.png";

function Restock() {
  const toastCtrl = toast;
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [priceSedan, setPriceSedan] = useState(0);
  const [priceSuv, setPriceSuv] = useState(0);
  const [pricePerformance, setPricePerformance] = useState(0);
  const [cars, setCars] = useState(0);
  const [rentDays, setRentDays] = useState(1);
  const [rented, setRented] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [restock, setRestock] = useState(0);
  const [carChoice, setCarChoice] = useState("sedan");
  // FOR SUCCESS
  async function presentToast(message) {
    toast.success(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      hideProgressBar: false,
      draggable: true,
      className: "toast-success",
    });
  }

  // FOR DANGER
  async function presentToastDanger(message) {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      hideProgressBar: false,
      draggable: true,
      className: "toast-danger",
    });
  }

  useEffect(() => {
    async function fetchData() {
      const rentalBalance = await carRentalService.methods
        .getRentalServiceBalance()
        .call();
      setBalance(rentalBalance);
      const rentalPrice = await carRentalService.methods
        .rentalPricePerDay()
        .call();
      setPrice(rentalPrice);
      const rentalPriceSedan = await carRentalService.methods
        .rentalPricePerDaySedan()
        .call();
      setPriceSedan(rentalPriceSedan);
      const rentalPriceSUV = await carRentalService.methods
        .rentalPricePerDaySuv()
        .call();
      setPriceSuv(rentalPriceSUV);
      const rentalPricePerformance = await carRentalService.methods
        .rentalPricePerDayPerformance()
        .call();
      setPricePerformance(rentalPricePerformance);
      const availableCars = await carRentalService.methods
        .availableCars()
        .call();
      setCars(availableCars);
      const rentedCarDays = await carRentalService.methods
        .rentedCars(web3.eth.defaultAccount)
        .call();
      if (rentedCarDays > 0) {
        setRented(true);
        setRentDays(rentedCarDays);
        const refund = rentedCarDays * rentalPrice;
        setRefundAmount(refund);
      }
    }
    fetchData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      // Call the contract's transferRentalBalanceToOwner function
      await carRentalService.methods
        .transferRentalBalanceToOwner()
        .send({ from: window.ethereum.selectedAddress });

      // Alert the user that the transfer was successful
      presentToast("Rental balance has been transferred to owner account!");
    } catch (err) {
      // Alert the user that the transfer failed
      presentToastDanger(
        "Failed to transfer rental balance/ you are not the owner"
      );
    }
  };

  const handleAddCar = async (event) => {
    event.preventDefault();
    try {
      const gas = await carRentalService.methods
        .restock(restock)
        .estimateGas({ from: window.ethereum.selectedAddress });
      const gasPrice = await web3.eth.getGasPrice();
      await carRentalService.methods
        .restock(restock)
        .send({
          from: window.ethereum.selectedAddress,
          gas: gas,
          gasPrice: gasPrice,
        });
      const availableCars = await carRentalService.methods
        .availableCars()
        .call();
      setCars(availableCars);
      presentToast("Car Successfully Restocked!");
    } catch (error) {
      console.log(error);
      presentToastDanger("Car failed to restocked, Only the owner can restock");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "lightblue",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ToastContainer className="toast-container" />
      <div
        style={{
          backgroundColor: "white",
          width: "100vh",
          border: "4px solid orange",
          borderRadius: "10px",
          padding: "15px",
        }}
      >
        <Container>
          <h1
            style={{
              backgroundColor: "orange",
              padding: "2%",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Car Rental - Owner
          </h1>

          <p className="lead">
            Rental balance: {web3.utils.fromWei(balance.toString(), "ether")}{" "}
            ETH
          </p>
          <p className="lead">Available cars: {cars}</p>
          <div className="col-md-6">
            <h3>Add new cars:</h3>
            <form onSubmit={handleAddCar}>
              <div className="form-group">
                <label htmlFor="restock">Restock Cars:</label>
                <input
                  type="number"
                  className="form-control"
                  id="restock"
                  value={restock}
                  onChange={(e) => setRestock(e.target.value)}
                />
              </div>
              <br></br>
              <button type="submit" className="btn btn-success rounded-start">
                Add Car
              </button>
            </form>
            <br></br>
            <h3>Transfer balance:</h3>
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label htmlFor="balance">
                  Transfer this balance to your account:
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="balance"
                  value={web3.utils.fromWei(balance.toString(), "ether")}
                  onChange={(e) =>
                    setBalance(web3.utils.toWei(e.target.value, "ether"))
                  }
                />
              </div>
              <br></br>
              <button type="submit" className="btn btn-success">
                Transfer Balance
              </button>
            </form>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Restock;
