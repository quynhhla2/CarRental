import React, { useState, useEffect } from "react";
import { web3, carRentalService } from "../src/contracts/CarRentalService";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import sedan from '../src/assets/car.png';
import suv from '../src/assets/SUV.jpg';
import performance from '../src/assets/performance.png';
import Home from '../src/pages/Home';
import Rent from '../src/pages/Rent';
import Restock from '../src/pages/Restock';
import Return from '../src/pages/Return';
function App() {
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
  const [carChoice, setCarChoice] = useState('sedan');
// FOR SUCCESS
async function presentToast(message) {
  toast.success(message, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 3000,
    hideProgressBar: false,
    draggable: true,
    className: 'toast-success',
  });
}

// FOR DANGER
async function presentToastDanger(message) {
  toast.error(message, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 3000,
    hideProgressBar: false,
    draggable: true,
    className: 'toast-danger',
  });
}


  
  useEffect(() => {
    async function fetchData() {
      const rentalBalance = await carRentalService.methods.getRentalServiceBalance().call();
      setBalance(rentalBalance);
      const rentalPrice = await carRentalService.methods.rentalPricePerDay().call();
      setPrice(rentalPrice);
      const rentalPriceSedan = await carRentalService.methods.rentalPricePerDaySedan().call();
      setPriceSedan(rentalPriceSedan);
      const rentalPriceSUV = await carRentalService.methods.rentalPricePerDaySuv().call();
      setPriceSuv(rentalPriceSUV);
      const rentalPricePerformance = await carRentalService.methods.rentalPricePerDayPerformance().call();
      setPricePerformance(rentalPricePerformance);
      const availableCars = await carRentalService.methods.availableCars().call();
      setCars(availableCars);
      const rentedCarDays = await carRentalService.methods.rentedCars(web3.eth.defaultAccount).call();
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
    const refundPercent = .25;
    event.preventDefault();
    let gas, gasPrice;
    if (carChoice === "sedan") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: priceSedan * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Sedan")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: priceSedan * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(priceSedan * rentDays * refundPercent);
    } else if (carChoice === "suv") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: priceSuv * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Suv")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: priceSuv * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(priceSuv * rentDays * refundPercent);
    } else if (carChoice === "performance") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: pricePerformance * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Performnace")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: pricePerformance * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(pricePerformance * rentDays * refundPercent);
    }
    setRented(true);
    
  
    // Display a success toast notification
    presentToast('Car Successfully Rented!');
  };
  

  const handleReturn = async (event) => {
    event.preventDefault();
    let refund;
    try {
      const gas = await carRentalService.methods.returnCar().estimateGas({ from: window.ethereum.selectedAddress });
      const gasPrice = await web3.eth.getGasPrice();
      await carRentalService.methods.returnCar().send({ from: window.ethereum.selectedAddress, gas: gas, gasPrice: gasPrice });
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
      presentToast('Car Successfully Returned!');
    } catch (error) {
      console.error(error);
      presentToastDanger('You didnt rent a car. No records found');
    }
  };
  
const handleTransfer = async (e) => {
  e.preventDefault();

  try {
    // Call the contract's transferRentalBalanceToOwner function
    await carRentalService.methods.transferRentalBalanceToOwner().send({ from: window.ethereum.selectedAddress });

    // Alert the user that the transfer was successful
    presentToast('Rental balance has been transferred to owner account!');
  } catch (err) {
    // Alert the user that the transfer failed
    presentToastDanger('Failed to transfer rental balance/ you are not the owner');
  }
};

  
  const handleAddCar = async (event) => {
    event.preventDefault();
    try {
      const gas = await carRentalService.methods.restock(restock).estimateGas({ from: window.ethereum.selectedAddress });
      const gasPrice = await web3.eth.getGasPrice();
      await carRentalService.methods.restock(restock).send({ from: window.ethereum.selectedAddress, gas: gas, gasPrice: gasPrice });
      const availableCars = await carRentalService.methods.availableCars().call();
      setCars(availableCars);
      presentToast('Car Successfully Restocked!');
    } catch (error) {
      console.log(error);
      presentToastDanger('Car failed to restocked, Only the owner can restock');
    }
  };

  return (
    <div className="container" style={{ backgroundColor: 'lightblue', height: '100vh', fontFamily: 'Arial' }}>
    <ToastContainer className="toast-container" />
    
    {/* Header */}
    <header className="App-header">
      {/* ... */}
    </header>
    
    {/* Main content */}
    <div style={{ backgroundColor: 'pink' }}>
    <Router>
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand as={Link} to="/">Car Rental</Navbar.Brand>
    <Nav className="me-auto">
      <Nav.Link as={Link} to="/rent">Rent</Nav.Link>
      <Nav.Link as={Link} to="/restock" className="ml-auto">Restock</Nav.Link>
    </Nav>
  </Navbar>
  <Routes> 
    <Route path="/" element={<Home />} />
    <Route path="/rent" element={<Rent />} />
    <Route path="/return" element={<Return />} />
    <Route path="/restock" element={<Restock />} />
  </Routes>
</Router>


    </div>
  </div>
  
  );
}

export default App;
