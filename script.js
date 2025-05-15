function checkFakeNews() {
  const text = document.getElementById("newsInput").value.trim();

  if (text === "") {
    alert("Please enter some news text.");
    return;
  }

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: text })
  })
  .then(response => response.json())
  .then(data => {
    let resultHTML = `<h3>Model Predictions:</h3>`;

    const fakeNewsConfidenceThresholds = {
      'Decision Tree': 99.79,
      'Gradient Boosting': 99.53,
      'Logistic Regression': 87.11,
      'Random Forest': 99.81
    };

    const verdicts = [];
    const confidenceScores = { 'Fake News': [], 'Factual News': [] };
    let uncertainCount = 0;

    for (let model in data) {
      const { label, confidence } = data[model];
      let displayLabel = label;
      let className = "";

      if (label === "Fake News" &&
          fakeNewsConfidenceThresholds[model] &&
          Math.abs(confidence - fakeNewsConfidenceThresholds[model]) < 0.01) {
        displayLabel = "Uncertain";
        className = "uncertain";
        uncertainCount++;
      } else {
        className = label === "Fake News" ? "fake" : "factual";
        if (label === "Fake News") confidenceScores['Fake News'].push(confidence);
        else if (label === "Factual News") confidenceScores['Factual News'].push(confidence);
        verdicts.push(label);
      }

      resultHTML += `${model}: <span class="label ${className}">${displayLabel}</span> (Confidence Score: ${confidence}%)<br>`;
    }

    let finalVerdict = "Uncertain - Input is out of scope";
    let finalClass = "uncertain";

    // Only show "Uncertain" final verdict if 2 or more models are uncertain
    if (uncertainCount < 2) {
      const fakeCount = verdicts.filter(v => v === "Fake News").length;
      const factualCount = verdicts.filter(v => v === "Factual News").length;

      if (fakeCount === 4 || fakeCount === 3) {
        finalVerdict = "Fake News";
        finalClass = "fake";
      } else if (factualCount === 4 || factualCount === 3) {
        finalVerdict = "Factual News";
        finalClass = "factual";
      } else if (fakeCount === 2 && factualCount === 2) {
        const avgFake = confidenceScores['Fake News'].reduce((a,b) => a + b, 0) / confidenceScores['Fake News'].length || 0;
        const avgFactual = confidenceScores['Factual News'].reduce((a,b) => a + b, 0) / confidenceScores['Factual News'].length || 0;

        if (avgFake > avgFactual) {
          finalVerdict = "Fake News";
          finalClass = "fake";
        } else {
          finalVerdict = "Factual News";
          finalClass = "factual";
        }
      }
    }

    resultHTML += `
<div class="final-verdict">
  <h3>Final Verdict: <span class="label ${finalClass}">${finalVerdict}</span></h3>
</div>`;

    document.getElementById("results").innerHTML = resultHTML;
  })
  .catch(error => {
    document.getElementById("results").innerHTML = "Error: " + error.message;
  });
}
