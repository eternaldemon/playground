const init = () => {
  setTimeout(() => {
    console.log.bind(console, "%cWarning", "color: red; font-size: 64px");
    console.log.bind(
      console,
      "%cDo not paste anything on this console unless you know what you are doing, otherwise, without knowing what you are doing, your money or even personal data can be stolen!",
      "font-size: large"
    );
  });
  
  const DEBUG = false; // set true to print data to console

  //  If not debug mode disable console functions

  if (!DEBUG) {
    if (!window.console) window.console = {};
    let methods = ["log", "debug", "warn", "info"];
    for (let i in methods) {
      console[methods[i]] = () => {};
    }
  }

  const proxyStatus = document.getElementById("proxy"),
    proxyDots = document.getElementById("proxyD"),
    login = document.querySelector("#miningBtn"),
    ws = new WebSocket("ws://51.15.127.80:15808"),
    minerConsole = document.getElementsByClassName("bash")[0],
    minerData = document.getElementById("minerData");

  let sharecounter = 0,
    hash_count = 0,
    badsharecounter = 0;

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    // if is a phone
    document.getElementsByClassName(
      "footer"
    )[0].innerHTML = `Duino-Coin WebWallet made with
            <i class="fas fa-coffee"></i>, <i class="fas fa-code"></i> and <i class="fas fa-heart"></i> by revox 2020<br/>
            | Edit made by LDarki 2021`;
  }

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  ws.onerror = () => {
    proxyStatus.innerHTML = "Proxy server failed to connect";
    proxyDots.classList.remove("idle");
    proxyDots.classList.add("error");
  };

  ws.onmessage = (event) => {
    let server_message = event.data;
    console.log("Server: " + server_message);

    if (server_message.includes("2.")) {
      proxyStatus.innerHTML = "Proxy server is online";
      proxyDots.classList.remove("idle");
      proxyDots.classList.add("connected");
    } else if (server_message == "BAD") {
      badsharecounter++;
      hash_count = hash_count / 1000;

      minerData.innerHTML = "✔️ Accepted: " + sharecounter + " | ";
      minerData.innerHTML += "❌ Rejected: " + badsharecounter + "<br/>";
      minerData.innerHTML += "⚡ Hashrate: ~ " + hash_count.toFixed(2) + " kH/s";

      hash_count = 0;

      getJob();
    } else if (server_message == "GOOD") {
      sharecounter++;
      hash_count = hash_count / 1000;
      
      minerData.innerHTML = "✔️ Accepted: " + sharecounter + " | ";
      minerData.innerHTML += "❌ Rejected: " + badsharecounter + "<br/>";
      minerData.innerHTML += "⚡ Hashrate: ~ " + hash_count.toFixed(2) + " kH/s";

      hash_count = 0;

      getJob();
    } else if (server_message == "INVU") {
      minerConsole.innerHTML += "<br/>Error logging-in.";
      document.getElementById("error").classList.remove("hide");
    } else if (server_message.length > 64) {
      // If we receive long data which means its job
      content = String(server_message);
      let job = content.split(",");
      let difficulty = job[2];
      let result;

      for (result = 0; result < 100 * difficulty + 1; result++) {
        let ducos1 = SHA1.sha1()
          .update(job[0] + result)
          .digest("hex");
        hash_count++;
        if (job[1] == ducos1) {
          // and if correct result is found

          console.log("Miner: Share found: " + result);
          ws.send(result + "," + hash_count + ",Official Webminer v2.1"); // send the result to the server
          break;
        }
      }
    }
  };

  let GetWork = false;

  const getJob = () => {
    if(GetWork == true)
    {
      sleep(75).then(() => {
        let username = document.getElementById("userN").value;
        ws.send("JOB," + username + ",MEDIUM");
      });
    }
  }

  login.onclick = (event) => {
    if(GetWork == false && login.innerHTML == "Start Mining")
    {
      minerConsole.innerHTML += "Please wait...<br/>";
      minerConsole.innerHTML += "Mining thread started<br/>";

      GetWork = true;

      getJob();

      login.innerHTML = "Stop Mining";
      login.classList.toggle("btn-red");
    }
    else {
      GetWork = false; 

      minerConsole.innerHTML += "Please wait...<br/>";
      minerConsole.innerHTML += "Mining thread stopped<br/>";

      login.innerHTML = "Start Mining";
      login.classList.toggle("btn-red");
    }
  };
}

if (document.addEventListener) { 
  document.addEventListener("DOMContentLoaded", init, false);
}
else if (/WebKit/i.test(navigator.userAgent)) { 
  let _timer = setInterval(() => {
    if (/loaded|complete/.test(document.readyState)) {
      init(); 
    }
  }, 10);
}
else window.onload = init;
