// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTName = "EventBase Ticket";
const NFTSymbol = "txFT";
const imageUri = "ipfs://bafybeidjmguiviozpgptmvbkq4mzivq5vp3uktw3fuouzk2i25binmfyxy";
const deployerAddress = "0x08d0d1572A8a714D90D670Ea344Dd23B1dF565Dd";

const EventTicketingModule = buildModule("EventTicketing", (m) => {
  const ticketNFT = m.contract("TicketNft", [NFTName, NFTSymbol, imageUri]);

  const eventContract = m.contract("EventTicketing", [ticketNFT, deployerAddress, 250]);

  // Set the EventTicketing contract as the minter in TicketNft
  m.call(ticketNFT, "setMinter", [eventContract]);

  const ticketResale = m.contract("TicketResaleMarket", [eventContract, ticketNFT, deployerAddress, 250]);

  return { ticketNFT, eventContract, ticketResale };
});

export default EventTicketingModule;
