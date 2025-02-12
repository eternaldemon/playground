const init = () => {
  setTimeout(() => {
    console.log.bind(console, "%cWarning", "color: red; font-size: 64px");
    console.log.bind(
      console,
      "%cDo not paste anything on this console unless you know what you are doing, otherwise, without knowing what you are doing, your money or even personal data can be stolen!",
      "font-size: large"
    );
  });

  const DEBUG = true; // set true to print data to console

  //  If not debug mode disable console functions

  if (!DEBUG) {
    if (!window.console) window.console = {};
    let methods = ["log", "debug", "warn", "info"];
    for (let i in methods) {
      console[methods[i]] = () => {};
    }
  }

  const loginpage = document.getElementsByClassName("login")[0],
    walletpage = document.getElementsByClassName("wallet")[0],
    status = document.getElementById("status"),
    loginstatus = document.getElementById("loginstatus"),
    navname = document.getElementById("navbar-name"),
    miners = document.getElementsByClassName("bash")[0],
    login = document.querySelector("#login"),
    send = document.querySelector("#send"),
    minerHashrate = document.getElementById("minerHR"),
    loader = document.getElementById("loader"),
    chartCtx = document.getElementById('dataChart').getContext('2d'),
    ws = new WebSocket("ws://51.15.127.80:15808"),
    transtable = document.getElementById("transTable");

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    document.getElementsByClassName(
      "footer"
    )[0].innerHTML = `Duino-Coin WebWallet made with
          <i class="fas fa-coffee"></i>, <i class="fas fa-code"></i> and <i class="fas fa-heart"></i> by revox 2020<br/>
          Background photo from pexels.com Edit made by LDarki 2021`;
  }

  var config = {
    type: 'line',
    data: {
      labels: ["0", "0", "0", "0", "0", "0", "0"],
      datasets: [{
        label: 'Amount',
        data: [0, 0, 0, 0, 0, 0, 0],
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        fill: false,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      animation: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
          }
        }]
      },
      legend: {
        display: false,
      }
    }
  };
  const chartData = new Chart(chartCtx, config);

  let version_received = 0,
    sendinfo = 0,
    ducoprice,
    oldbalance = 0,
    curr_bal = 0,
    profitcheck = 0,
    balance = 0,
    totalHashes = 0;

  ws.onclose = (code) => {
    console.log('ws is closed with code: ' + code.code);
  };

  n = new Date();
  y = n.getFullYear();
  m = n.getMonth() + 1;
  d = n.getDate();
  document.getElementById("date").innerHTML =
    "<img height='16em' width='16em' src='https://github.com/revoxhere/duino-coin/blob/master/Resources/NewWallet.ico?raw=true'>&nbsp;DUCO WebWallet (v2.2) " +
    d +
    "/" +
    m +
    "/" +
    y;

  if (d == 14 && m == 2) {
    document.getElementById("date").innerHTML =
      "❤️&nbsp;DUCO WebWallet (v2.2) " + d + "/" + m + "/" + y;
    document.head.innerHTML += `<style>
    .bash {
      background-image: -o-radial-gradient(var(--scroll-track) 8.1333333333px, transparent 9.1333333333px),
      -o-radial-gradient(var(--scroll-track) 8.1333333333px, transparent 9.1333333333px),
      -o-radial-gradient(var(--scroll-track) 16.2666666667px, transparent 17.2666666667px),
      -o-radial-gradient(var(--scroll-track) 16.2666666667px, transparent 17.2666666667px),
      -o-linear-gradient(315deg, var(--scroll-track) 6%, var(--hover) 6.45%, var(--hover) 44%, transparent 46%, transparent 63%, var(--hover) 63.25%), 
      -o-linear-gradient(45deg, transparent 39.75%, var(--scroll-track) 40.5%, var(--scroll-track) 60%, transparent 0, transparent 93.25%, var(--scroll-track) 94%);
      background-image: radial-gradient(var(--scroll-track) 8.1333333333px, transparent 9.1333333333px),
      radial-gradient(var(--scroll-track) 8.1333333333px, transparent 9.1333333333px),
      radial-gradient(var(--scroll-track) 16.2666666667px, transparent 17.2666666667px),
      radial-gradient(var(--scroll-track) 16.2666666667px, transparent 17.2666666667px),
      linear-gradient(135deg, var(--scroll-track) 6%, var(--hover) 6.45%, var(--hover) 44%, transparent 46%, transparent 63%, var(--hover) 63.25%), 
      linear-gradient(45deg, transparent 39.75%, var(--scroll-track) 40.5%, var(--scroll-track) 60%, transparent 0, transparent 93.25%, var(--scroll-track) 94%);
      background-size: 122px 122px;
      background-position: 54.4933333333px 56.9333333333px, 68.32px 56.9333333333px, -8.1333333333px -8.1333333333px, 16.2666666667px -8.1333333333px, 0 0, 0 0;
    }
    </style>`;
  }

  if (d == 31 && m == 10) {
    document.getElementById("date").innerHTML =
      "🎃&nbsp;DUCO WebWallet (v2.2) " + d + "/" + m + "/" + y;

    document.head.innerHTML += `<style>
    .spider {
      display: block !important;
    }
    </style>`;
  }

  if(isMobile.any())
  {
    document.getElementById("datePhone").innerHTML = document.getElementById("date").innerHTML;
    document.querySelector(".sideBar").remove();
  }

  // Get duco coin price

  getJSON(
    "http://51.15.127.80/api.json"
  ).then((data) => {
    ducoprice = `${data["Duco price"]}`;
    let cutducoprice = 1 * ducoprice;
    cutducoprice = cutducoprice.toFixed(6);
    document.getElementById("ducoprice").innerHTML = cutducoprice + " $";
    console.log(data);
  });

  const calculateHashrate = (hashes) => {
    hashes = parseFloat(hashes);
    let hashrate = hashes.toFixed(2) + " H/s";

    if (hashes / 1000 > 0.5) hashrate = (hashes / 1000).toFixed(2) + " kH/s";
    if (hashes / 1000000 > 0.5)
      hashrate = (hashes / 1000000).toFixed(2) + " MH/s";
    if (hashes / 1000000000 > 0.5)
      hashrate = (hashes / 1000000000).toFixed(2) + " GH/s";

    return hashrate;
  };

  const MinerApi = (username) => {
    let myMiners = [];
    let contentjson = {};
    getJSON(
      "http://51.15.127.80/api.json"
    ).then((data) => {
      contentjson = data;
      for (process in contentjson["Miners"]) {
        if (contentjson["Miners"][process]["User"].includes(username)) {
          myMiners.push(contentjson["Miners"][process]);
        }
      }
      miners.innerHTML = "";
      for (miner in myMiners) {
        let IsEstimated = "";
        if (myMiners[miner]["Is estimated"] == "True") {
          IsEstimated = " (Estimated)";
        }
        if(myMiners[miner]["Identifier"] == "None") {
            minerId = "";
        } else {
            minerId = myMiners[miner]["Identifier"];
        }
        miners.innerHTML +=
          "<li>#" +
          miner +
          ": " +
          minerId +
          " (" +
          myMiners[miner]["Software"] +
          ") " +
          calculateHashrate(myMiners[miner]["Hashrate"]) +
          IsEstimated +
          " @ diff " +
          myMiners[miner]["Diff"] +
          ", " +
          myMiners[miner]["Accepted"] +
          "/" +
          (myMiners[miner]["Accepted"] + myMiners[miner]["Rejected"]) +
          " (" +
          Math.round(
            (myMiners[miner]["Accepted"] /
              (myMiners[miner]["Accepted"] + myMiners[miner]["Rejected"])) *
              100
          ) +
          "%)" +
          " acc. (" +
          myMiners[miner]["Sharetime"] +
          "ms)</li>";

        totalHashes = totalHashes + myMiners[miner]["Hashrate"];
      }
    });
    minerHashrate.innerHTML = "⚡ Hashrate: ~" + calculateHashrate(totalHashes);
    totalHashes = 0;
  };

  const ProfitCalculator = () => {
    let prev_bal = curr_bal;
    curr_bal = balance;

    let daily = (((curr_bal - prev_bal)*6)*60)*24;

    profitcheck++;

    if ((curr_bal - prev_bal) > 0 && profitcheck > 1) {
      document.getElementById("profitlabel").innerHTML =
        "~" + daily.toFixed(4) + " ᕲ/24h";
    }
  };

  ws.onerror = () => {
    loginstatus.innerHTML = "Proxy server failed to connect";
    status.classList.remove("idle");
    status.classList.add("error");
  };

  ws.onmessage = (event) => {
    let server_message = event.data;
    let servermsg = server_message;
    servermsg = servermsg.replaceAll("'", '"').replaceAll("&#39;", '"');
    console.log("Server: " + server_message);

    if (version_received == 0 && server_message.includes("2.")) {
      loginstatus.innerHTML = "Proxy server is online";
      status.classList.remove("idle");
      status.classList.add("connected");
      version_received = 1;
    } else if (server_message == "OK") {
      loginstatus.innerHTML = "Logged-in successfully!";

      let username = document.getElementById("username").value;

      navname.innerHTML = username;

      window.setInterval(() => {
        loader.style.display = "none";
        loader.style.opacity = "0";

        walletpage.style.display = "block";
        walletpage.style.opacity = "1";
      }, 500);

      window.setInterval(() => {
        MinerApi(username);
      }, 3500);

      window.setInterval(() => {
        ProfitCalculator();
      }, 10000);

    } else if (server_message.includes("NO")) {
      if(sendinfo == 0)
      {
        loginpage.style.display = "block";
        loginpage.style.opacity = "1";
  
        loader.style.display = "none";
        loader.style.opacity = "0";
        document.getElementById("error").classList.remove("hide");
      }
      else {
        document.getElementById("notificateErr").classList.remove("hide");
      }
    } else if (
      version_received == 1 &&
      hasKeys(servermsg)
      ) {

      jsonD = eval('(' + servermsg + ')');

      transtable.innerHTML = "";
      for (var i in jsonD)
      {
        let classD = "positive";
        let symbolD = "+";

        if(jsonD[i].Sender == document.getElementById("username").value) 
        {
          classD = "negative";
          symbolD = "-";
        }
        
        transtable.innerHTML += `<tr>
          <td data-label="Date">${jsonD[i].Date}</td>
          <td data-label="Amount" class="${classD}">${symbolD} ${jsonD[i].Amount.toFixed(6)}</td>
        </tr>`;
      }
    } else if (
      version_received == 1 &&
      server_message.includes(".") &&
      !isNaN(server_message) &&
      server_message.toString().indexOf(".") != -1
    ) {
      balanceusd = ducoprice * server_message;
      balanceusd = balanceusd.toFixed(2);

      balance = server_message * 1;
      cutbalance = balance.toFixed(6);

      difference = balance - oldbalance;
      difference = difference.toFixed(6);

      if (difference != 0) {
        oldbalance = cutbalance;
        let today = new Date();
        let time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();

        chartData.data.labels.push(time);
        chartData.data.labels.splice(0, 1); // remove first label
    
        chartData.data.datasets.forEach((dataset) => {
          dataset.data.push(difference); 
          dataset.data.splice(0, 1); // remove first data point
        });

        chartData.update();
      }

      if(Number.isNaN(balanceusd)) balanceusd = " Error";
      document.getElementById("balancetext").innerHTML = cutbalance + " ᕲ ($"+balanceusd+")";
    } else if (sendinfo == 1) {
      document.getElementById("notificate").classList.remove("hide");
      sendinfo = 0;
    }
  };

  document.getElementsByClassName("alertC")[0].onclick = (event) => {
    document.getElementById("notificate").classList.add("hide");
  };

  document.getElementsByClassName("alertCErr")[0].onclick = (event) => {
    document.getElementById("notificateErr").classList.add("hide");
  };

  login.onclick = (event) => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    loginpage.style.display = "none";
    loginpage.style.opacity = "0";

    loader.style.display = "block";
    loader.style.opacity = "1";

    ws.send("LOGI," + username + "," + password);
    window.setInterval(() => {
      if (isWSOpen(ws) && sendinfo == 0) {
          ws.send("BALA");
      }
    }, 1000);
    
    window.setInterval(() => {
      if (isWSOpen(ws) && sendinfo == 0) {
          ws.send("GTXL," + document.getElementById("username").value + ",7");
      }
    }, 3000);
  };

  send.onclick = (event) => {
    let recipient = document.getElementById("recipient").value;
    let amount = document.getElementById("amountInput").value;
    if(amount && recipient)
    {
      ws.send("SEND,-," + recipient + "," + amount);
      sendinfo = 1;
    }
  };

  document
    .getElementsByClassName("login-container")[0]
    .addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        login.click();
      }
    });

  // Modal Functions

  const trigger = document.querySelector(".modal_trigger");
  const modal = document.querySelector(".modal");
  const modalbg = document.querySelector(".modal_bg");
  const content = document.querySelector(".modal_content");
  const closer = document.querySelector(".modal_close");
  const w = window;
  let isOpen = false;
  const contentDelay = 100;
  const len = trigger.length;

  var getId = function (event) {
    event.preventDefault();
    var self = this;
    makeDiv(self, modal);
  };

  var makeDiv = function (self, modal) {
    var fakediv = document.getElementById("modal_temp");
    if (fakediv === null) {
      var div = document.createElement("div");
      div.id = "modal_temp";
      self.appendChild(div);
      moveTrig(self, modal, div);
    }
  };

  var moveTrig = function (trig, modal, div) {
    var trigProps = trig.getBoundingClientRect();
    var m = modal;
    var mProps = m.querySelector(".modal_content").getBoundingClientRect();
    var transX, transY, scaleX, scaleY;
    var xc = w.innerWidth / 2;
    var yc = w.innerHeight / 2;

    trig.classList.add("modal_trigger--active");

    scaleX = mProps.width / trigProps.width;
    scaleY = mProps.height / trigProps.height;

    scaleX = scaleX.toFixed(3);
    scaleY = scaleY.toFixed(3);

    transX = Math.round(xc - trigProps.left - trigProps.width / 2);
    transY = Math.round(yc - trigProps.top - trigProps.height / 2);

    if (m.classList.contains("modal--align-top")) {
      transY = Math.round(
        mProps.height / 2 + mProps.top - trigProps.top - trigProps.height / 2
      );
    }

    div.style.transform = "scale(" + scaleX + "," + scaleY + ")";
    div.style.webkitTransform = "scale(" + scaleX + "," + scaleY + ")";

    window.setTimeout(function () {
      window.requestAnimationFrame(function () {
        open(m, div);
      });
    }, contentDelay);
  };

  var open = function (m, div) {
    if (!isOpen) {
      var content = m.querySelector(".modal_content");
      m.classList.add("modal--active");
      content.classList.add("modal_content--active");
      content.addEventListener("transitionend", hideDiv, false);
      isOpen = true;
    }

    function hideDiv() {
      div.style.opacity = "0";
      content.removeEventListener("transitionend", hideDiv, false);
    }
  };

  var close = function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    var target = event.target;
    var div = document.getElementById("modal_temp");

    if (
      (isOpen && target.classList.contains("modal_bg")) ||
      target.classList.contains("modal_close")
    ) {
      div.style.opacity = "1";
      div.removeAttribute("style");
      modal.classList.remove("modal--active");
      content.classList.remove("modal_content--active");
      trigger.style.transform = "none";
      trigger.style.webkitTransform = "none";
      trigger.classList.remove("modal_trigger--active");

      div.addEventListener("transitionend", removeDiv, false);
      isOpen = false;
    }

    function removeDiv() {
      setTimeout(function () {
        window.requestAnimationFrame(function () {
          div.remove();
        });
      }, contentDelay - 50);
    }
  };
  trigger.addEventListener("click", getId, false);
  closer.addEventListener("click", close, false);
  modalbg.addEventListener("click", close, false);

  var donateBtns = document.querySelectorAll("#donate");

  [].forEach.call(donateBtns, function (div) {
    div.onclick = () => {
      var copyText = document.getElementById(div.dataset.id);
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand("copy");
    };
  });

  /* THEME CHANGER */

  const switcher = document.getElementById("theme-changer");

  const themeStyle = document.createElement("link");
  themeStyle.rel = "stylesheet";
  document.head.appendChild(themeStyle);

  if (localStorage.getItem("mode") === "blue") {
    themeStyle.href = "assets/css/blue.css";
    switcher.checked = true;
  } else {
    themeStyle.href = "assets/css/gray.css";
    switcher.checked = false;
  }

  switcher.onchange = () => {
    if (switcher.checked == true) {
      localStorage.setItem("mode", "blue");
      themeStyle.href = "assets/css/blue.css";
    } else {
      localStorage.setItem("mode", "gray");
      themeStyle.href = "assets/css/gray.css";
    }
  };
};

if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
} else if (/WebKit/i.test(navigator.userAgent)) {
  let _timer = setInterval(() => {
    if (/loaded|complete/.test(document.readyState)) {
      init();
    }
  }, 10);
} else window.onload = init;
