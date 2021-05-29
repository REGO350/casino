const SERVER_URL = "https://oxier2akjysv.moralis.io:2053/server";
const APPLICATION_ID = "PSOHooRdsiTBOywifwEZbxgC8fIDkxrFgdhvCf9A";
var contractAddress = "0xBB07E1F6AF04C5Aecd36ed480e4d951af5865319";

Moralis.initialize(APPLICATION_ID); // Application id from moralis.io
Moralis.serverURL = SERVER_URL; //Server url from moralis.io

function addRowToTable(tableId, data){
  let tableRow = $("<tr></tr>");
  data.forEach(element => {
    let newColumn = $("<td></td>").text(element);
    tableRow.append(newColumn);
  });
  $(`#${tableId}`).append(tableRow);
}

async function login() {
  try {
    user = await Moralis.User.current();
    if (!user) {
      console.log("authenticate");
      user = await Moralis.Web3.authenticate();
    }
    console.log(user);
    $("#login_button").css("display", "none");
    $("#logout_button").css("display", "block");
    $("#game").css("display", "block");

    let biggestWinners = await Moralis.Cloud.run("biggestWinners", {});
    biggestWinners.forEach((row)=>{
      addRowToTable("top_winners", [row.objectId, row.total]);
    });

    let biggestLosers = await Moralis.Cloud.run("biggestLosers", {});
    biggestLosers.forEach((row)=>{
      addRowToTable("top_losers", [row.objectId, row.total]);
    });

    let biggestBets = await Moralis.Cloud.run("biggestBets", {});
    biggestBets.forEach((row)=>{
      addRowToTable("biggest_bets", [row.user, row.bet, row.win]);
    });

  } catch (error) {
    console.log(error);
  }
}

async function logout(){
  await Moralis.User.logOut();
  alert("Logged out");
  $("#login_button").css("display", "block");
  $("#logout_button").css("display", "none");
  $("#game").css("display", "none");

}

async function flip(side) {
  let amount = $("#amount").val();
  window.web3 = await Moralis.Web3.enable();
  let contractInstance = new web3.eth.Contract(window.abi, contractAddress);
  contractInstance.methods
    .flip(side == "heads" ? 0 : 1)
    .send({ value: amount, from: ethereum.selectedAddress })
    .on("receipt", (receipt) => {
      console.log(receipt);
      if (receipt.events.bet.returnValues.win) {
        alert("you won");
      } else {
        alert("you lost");
      }
    });
}

$("#login_button").click(() => {
  login();
});

$("#logout_button").click(() => {
  logout();
});

$("#heads_button").click(() => {
  flip("heads");
});

$("#tails_button").click(() => {
  flip("tails");
});
