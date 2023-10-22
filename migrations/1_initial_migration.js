
const CarRentalService = artifacts.require("CarRentalService");
module.exports = function (deployer) {
    const availableCars = 10;

    deployer.deploy(CarRentalService, availableCars);
};