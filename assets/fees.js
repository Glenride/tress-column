(function(){
  "use strict";
/* ---------- fee comparison: Patient vs Uncommitted ---------- */
  /* Per spec §6.3: the fee applies to a trade whose *starting* cumulative
     volume is already at or above the launch's gate. The trade that crosses
     the gate is still fee-free; the next trade is not. */
  var range = document.getElementById("volRange");
  var volOut = document.getElementById("volOut");
  var feePatient = document.getElementById("feePatient");
  var feeRisk = document.getElementById("feeRisk");
  var cmpDiff = document.getElementById("cmpDiff");
  var gateNote = document.getElementById("gateNote");
  var GATE_PATIENT = 10000000, GATE_RISK = 20000;
  var RATE_PATIENT = 0.003, RATE_RISK = 0.0058;
  function fmtVol(v){
    if (v >= 1000000) {
      var m = v / 1000000;
      return "$" + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M";
    }
    if (v >= 1000) return "$" + Math.round(v / 1000) + "K";
    return "$" + v;
  }
  function money(n){ return "$" + n.toFixed(2); }
  function updateGate(){
    var v = parseInt(range.value, 10);
    range.style.setProperty("--fill", (v / 20000000 * 100) + "%");
    volOut.textContent = fmtVol(v);
    var fp = v >= GATE_PATIENT ? 1000 * RATE_PATIENT : 0;
    var fr = v >= GATE_RISK ? 1000 * RATE_RISK : 0;
    feePatient.textContent = money(fp);
    feeRisk.textContent = money(fr);
    if (fp === 0 && fr === 0) {
      cmpDiff.innerHTML = "No difference yet — <b>neither launch pays anything</b> on this trade.";
      gateNote.innerHTML = "Both launches are below their gates, so Tress Column takes <b>nothing</b> from either trade — and never your token. The fee, when it applies, comes only from the quote-asset side (WETH / USDC).";
    } else if (fp === 0) {
      cmpDiff.innerHTML = "The Platinum launch keeps <b>$5.80 more</b> on this trade — its first $10M of volume is free.";
      gateNote.innerHTML = "The Platinum launch is still below its $10M gate — <b>$0</b> on the trade. The Silver launch passed its $20K gate long ago. Same trade, same volume: the difference is the lock.";
    } else {
      cmpDiff.innerHTML = "Both launches are past their gates. The Platinum launch still keeps <b>$2.80 more</b> on this trade — and its first $10M still cost it nothing.";
      gateNote.innerHTML = "Past the $10M gate, the Platinum launch pays its fixed <b>0.30%</b> — $3.00 on this trade. The fee comes only from the quote-asset side, and the rate can never be raised.";
    }
  }
  range.addEventListener("input", updateGate);
  updateGate();

  
})();
