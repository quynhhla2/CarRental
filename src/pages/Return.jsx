import React, { useState, useEffect } from "react";
import { web3, carRentalService } from "../contracts/CarRentalService";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar, Nav, Container } from 'react-bootstrap';



function Return() {
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
  

  return (
    
    <div className="container" style={{ backgroundColor: 'lightblue', height: '100vh'}}>
    <ToastContainer className="toast-container" />
    <header className="App-header">
     
    </header>
    <div style={{ backgroundColor: 'lightblue' }}>

      <Container>
      <h1>Car Rental Service</h1>
      <p className="lead">Rental balance: {web3.utils.fromWei(balance.toString(), 'ether')} ETH</p>
      <p className="lead">Available cars: {cars}</p>
      <div>
        <p className="lead">You are currently renting a car for {rentDays} day(s).</p>
        <p className="lead">You will receive a refund of {web3.utils.fromWei(refundAmount.toString(), 'ether')} ETH when you return the car.</p>
        <form onSubmit={handleReturn}>
          <button type="submit" className="btn btn-primary">Return Car</button>
        </form>
      </div>
      </Container>
    </div>
    
  </div>
    
  );
}

export default Return;
