// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract CarRentalService {
    // State variables
    address public owner;
    uint public rentalPricePerDay;
    uint public rentalPricePerDaySedan;
    uint public rentalPricePerDaySuv;
    uint public rentalPricePerDayPerformance;
    uint public availableCars;

    mapping (address => uint) public customerBalance;
    mapping (address => uint) public rentedCars;

    // Constructor
    constructor(uint _availableCars) payable {
        owner = msg.sender;
        rentalPricePerDay = 1 ether + 1 ether;
        rentalPricePerDaySedan = 2 ether;
        rentalPricePerDaySuv = 3 ether;
        rentalPricePerDayPerformance = 4 ether;
        availableCars = _availableCars;
    }

    // Functions
    function getRentalServiceBalance() public view returns (uint _balance) {
        return address(this).balance;
    }

    function restock(uint _quantity) public {
        require(msg.sender == owner, "Only the owner can restock this rental service.");
        availableCars += _quantity;
    }
    function transferRentalBalanceToOwner() public {
        require(msg.sender == owner, "Only the owner can transfer the rental balance.");

        uint rentalBalance = address(this).balance;
        require(rentalBalance > 0, "There is no rental balance to transfer.");

        payable(owner).transfer(rentalBalance);
    }

    function rentCar_Day(string memory _carChoice, uint _rentDays) public payable {
        uint carRentalPrice;
        if (keccak256(bytes(_carChoice)) == keccak256(bytes("sedan"))) {
            carRentalPrice = rentalPricePerDaySedan;
        } else if (keccak256(bytes(_carChoice)) == keccak256(bytes("suv"))) {
            carRentalPrice = rentalPricePerDaySuv;
        } else if (keccak256(bytes(_carChoice)) == keccak256(bytes("performance"))) {
            carRentalPrice = rentalPricePerDayPerformance;
        } else {
            revert("Invalid car choice.");
        }
        require(msg.value >= carRentalPrice * _rentDays, "Not enough funds.");
        require(availableCars > 0, "No cars available.");
        require(rentedCars[msg.sender] == 0, "You can only rent one car at a time.");

        customerBalance[msg.sender] += msg.value;
        rentedCars[msg.sender] = _rentDays;
        availableCars -= 1;
    }

 function returnCar() public {
    require(rentedCars[msg.sender] > 0, "You haven't rented any cars.");
    
    uint daysRented = rentedCars[msg.sender];
    uint refundAmount;
    
    if (daysRented <= 2) {
        refundAmount = daysRented * rentalPricePerDay;
    } else {
        if (rentedCars[msg.sender] == 1) {
            refundAmount = 2 * rentalPricePerDay + (daysRented - 2) * rentalPricePerDaySedan;
        } else if (rentedCars[msg.sender] == 2) {
            refundAmount = 2 * rentalPricePerDay + (daysRented - 2) * rentalPricePerDaySuv;
        } else if (rentedCars[msg.sender] == 3) {
            refundAmount = 2 * rentalPricePerDay + (daysRented - 2) * rentalPricePerDayPerformance;
        }
    }
    
    rentedCars[msg.sender] = 0;
    availableCars += 1;

    // transfer the refund amount from contract to the caller address
    payable(msg.sender).transfer(refundAmount);
}


}
