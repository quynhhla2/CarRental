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
import Home from "../pages/Home";
import Restock from "../pages/Restock";
import Return from "../pages/Return";
function Rent() {
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

  const handleRent = async (event) => {
    const refundPercent = 0.25;
    event.preventDefault();
    let gas, gasPrice;
    if (carChoice === "sedan") {
      gas = await carRentalService.methods
        .rentCar_Day(carChoice, rentDays)
        .estimateGas({
          from: window.ethereum.selectedAddress,
          value: priceSedan * rentDays,
        });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Sedan");
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({
        from: window.ethereum.selectedAddress,
        value: priceSedan * rentDays,
        gas: gas,
        gasPrice: gasPrice,
      });
      setRefundAmount(priceSedan * rentDays * refundPercent);
    } else if (carChoice === "suv") {
      gas = await carRentalService.methods
        .rentCar_Day(carChoice, rentDays)
        .estimateGas({
          from: window.ethereum.selectedAddress,
          value: priceSuv * rentDays,
        });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Suv");
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({
        from: window.ethereum.selectedAddress,
        value: priceSuv * rentDays,
        gas: gas,
        gasPrice: gasPrice,
      });
      setRefundAmount(priceSuv * rentDays * refundPercent);
    } else if (carChoice === "performance") {
      gas = await carRentalService.methods
        .rentCar_Day(carChoice, rentDays)
        .estimateGas({
          from: window.ethereum.selectedAddress,
          value: pricePerformance * rentDays,
        });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Performnace");
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({
        from: window.ethereum.selectedAddress,
        value: pricePerformance * rentDays,
        gas: gas,
        gasPrice: gasPrice,
      });
      setRefundAmount(pricePerformance * rentDays * refundPercent);
    }
    setRented(true);

    // Display a success toast notification
    presentToast("Car Successfully Rented!");
  };

  const handleReturn = async (event) => {
    event.preventDefault();
    let refund;
    try {
      const gas = await carRentalService.methods
        .returnCar()
        .estimateGas({ from: window.ethereum.selectedAddress });
      const gasPrice = await web3.eth.getGasPrice();
      // Pass the refund amount as a parameter to the returnCar function
      await carRentalService.methods.returnCar().send({
        from: window.ethereum.selectedAddress,
        gas: gas,
        gasPrice: gasPrice,
      });
      
      setRented(false);
      setRentDays(1);
      const refundPercent = 0.25;
      // Calculate the refund amount based on the car type
      if (carChoice === "sedan") {
        refund = priceSedan * rentDays * refundPercent;
      } else if (carChoice === "suv") {
        refund = priceSuv * rentDays * refundPercent;
      } else if (carChoice === "performance") {
        refund = pricePerformance * rentDays * refundPercent;
      } else {
        refund = 0;
      }
      setRefundAmount(refund);
      presentToast("Car Successfully Returned!");
    } catch (error) {
      console.error(error);
      presentToastDanger("You didn't rent a car. No records found");
    }
  };
  

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
      await carRentalService.methods.restock(restock).send({
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
      className="container"
      style={{
        backgroundColor: "lightblue",
        height: "100vh",
        fontFamily: "Arial",
      }}
    >
      <ToastContainer className="toast-container" />
      <header className="App-header"></header>
      <div style={{ backgroundColor: "lightblue" }}>
        <Container>
          <h1>Car Rental Service</h1>
          {!rented ? (
            <div className="d-flex align-items-center">
              <i className="bi bi-car-fill text-primary me-2"></i>
              <p className="lead mb-0">Available cars: {cars}</p>
            </div>
          ) : null}

          {rented ? (
            <div
              className="container"
              style={{
                width: "100%",
                height: "20%",
                backgroundColor: "white",
                border: "4px solid orange",
                borderRadius: "10px",
                padding: "15px",
              }}
            >
              <div>
                <p className="lead">
                  You are currently renting a car for {rentDays} day(s).
                </p>
                <p className="lead">
                  You will receive a refund
                  when you return the car.
                </p>
                <form onSubmit={handleReturn}>
                  <button type="submit" className="btn btn-danger rounded-end">
                    Return Car
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <form onSubmit={handleRent}>
                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    gap: "3rem",
                    flex: "1",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    class="card"
                    style={{
                      width: "18rem",
                      border: "4px solid orange",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <img src={sedan} class="card-img-top" alt="Sedan" />
                    <div
                      class="card-body"
                      style={{
                        backgroundColor: "lightgrey",
                        borderRadius: "10px",
                      }}
                    >
                      <h5 class="card-title">Car</h5>
                      <p class="card-text">Price : 2ETH/Day</p>
                      <p class="card-text">Brand : Chevrolet</p>
                      <p class="card-text">Model : Spark</p>
                      <p class="card-text">Color : Burning Hot Metallic</p>
                    </div>
                  </div>
                  <div
                    class="card"
                    style={{
                      width: "18rem",
                      border: "4px solid orange",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <img src={suv} class="card-img-top" alt="SUV" />
                    <div
                      class="card-body"
                      style={{
                        backgroundColor: "lightgrey",
                        borderRadius: "10px",
                      }}
                    >
                      <h5 class="card-title">SUV</h5>
                      <p class="card-text">Price : 3ETH/Day</p>
                      <p class="card-text">Brand : Chevrolet</p>
                      <p class="card-text">Model : Tahoe</p>
                      <p class="card-text">Color : Black</p>
                    </div>
                  </div>
                  <div
                    class="card"
                    style={{
                      width: "18rem",
                      border: "4px solid orange",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <img
                      src={performance}
                      class="card-img-top"
                      alt="Pick-up Truck"
                    />
                    <div
                      class="card-body"
                      style={{
                        backgroundColor: "lightgrey",
                        borderRadius: "10px",
                      }}
                    >
                      <h5 class="card-title">Performance</h5>
                      <p class="card-text">Price : 4ETH/Day</p>
                      <p class="card-text">Brand : Chevrolet</p>
                      <p class="card-text">Model : Camaro</p>
                      <p class="card-text">Color : Radiant Red Tincoat</p>
                    </div>
                  </div>
                  <br></br>
                </div>
                <div className="row">
                  <div className="form-group col-6">
                    <label htmlFor="carChoice">Choose a Car:</label>
                    <select
                      className="form-control"
                      id="carChoice"
                      value={carChoice}
                      onChange={(e) => setCarChoice(e.target.value)}
                    >
                      <option value="sedan">Car</option>
                      <option value="suv">SUV</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>
                  <div className="form-group col-6">
                    <label htmlFor="rentDays">Rent car for :</label>
                    <div style={{ position: "relative" }}>
                      <input
                        placeholder="Days"
                        type="number"
                        className="form-control"
                        id="rentDays"
                        value={rentDays}
                        onChange={(e) => setRentDays(e.target.value)}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          padding: "0 5px",
                        }}
                      >
                        days
                      </span>
                    </div>
                  </div>
                </div>
                <br></br>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    type="submit"
                    className="btn btn-success rounded-start"
                  >
                    Rent Car
                  </button>
                  <button
                      className="btn btn-danger rounded-end"
                      onClick={handleReturn}
                    >
                      Return
                    </button>
                </div>
              </form>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default Rent;
