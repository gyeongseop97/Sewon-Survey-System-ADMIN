대시보드 그래프 레이아웃 수정 사항

1. CSS 수정
기존:
.dashboard-chart-grid {
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:18px;
  margin-top:0;
}

수정:
.dashboard-chart-grid {
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:20px;
  margin-top:0;
}

.dashboard-chart-panel canvas {
  height: 320px !important;
}

@media (max-width: 1200px) {
  .dashboard-chart-grid {
    grid-template-columns: 1fr;
  }
}

------------------------------------------------------------

2. chartsTab 전체 교체

기존 dashboard-chart-grid 부분을 아래로 교체:

<div>
  <div class="dashboard-title">월별 온실가스 배출량 추이</div>

  <div class="dashboard-chart-grid">

    <div class="dashboard-chart-panel">
      <h3>Scope1 (직접 배출)</h3>
      <canvas id="scope1MonthlyChart" width="700" height="320"></canvas>
    </div>

    <div class="dashboard-chart-panel">
      <h3>Scope2 (간접 배출)</h3>
      <canvas id="scope2MonthlyChart" width="700" height="320"></canvas>
    </div>

    <div class="dashboard-chart-panel">
      <h3>Scope3 (기타 간접배출)</h3>
      <canvas id="scope3MonthlyChart" width="700" height="320"></canvas>
    </div>

    <div class="dashboard-chart-panel">
      <h3>Scope 구성비율</h3>
      <canvas id="scopePieChart" width="700" height="320"></canvas>
    </div>

  </div>

  <div class="dashboard-total-line">
    <span>연간 온실가스 배출량 계(Scope1+Scope2)</span>
    <span class="dashboard-total-value" id="dashboardAnnualTotal">
      0.000 tCO2e
    </span>
  </div>
</div>

------------------------------------------------------------

3. renderCharts 함수 수정

기존:
function renderCharts(){
  renderDashboardTable();
  drawMonthlyScopeChart("scope1MonthlyChart","Scope 1");
  drawMonthlyScopeChart("scope2MonthlyChart","Scope 2");
  updateDashboardAnnualTotal();
}

수정:
function renderCharts(){
  renderDashboardTable();

  drawMonthlyScopeChart("scope1MonthlyChart","Scope 1");
  drawMonthlyScopeChart("scope2MonthlyChart","Scope 2");
  drawMonthlyScopeChart("scope3MonthlyChart","Scope 3");

  drawScopePieChart();

  updateDashboardAnnualTotal();
}

------------------------------------------------------------

4. 아래 함수 추가

function drawScopePieChart(){
  const canvas = $("scopePieChart");
  if(!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const values = [
    sumByScope("Scope 1"),
    sumByScope("Scope 2"),
    sumByScope("Scope 3")
  ];

  const labels = ["Scope1","Scope2","Scope3"];
  const colors = ["#8b5cf6","#10b981","#0ea5e9"];

  const total = values.reduce((a,b)=>a+b,0);

  if(total <= 0){
    drawEmptyChartMessage(ctx,canvas,"표시할 데이터가 없습니다.");
    return;
  }

  let start = 0;

  values.forEach((v,i)=>{
    const angle = (v / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(200,160);
    ctx.arc(200,160,110,start,start+angle);
    ctx.closePath();

    ctx.fillStyle = colors[i];
    ctx.fill();

    start += angle;
  });

  labels.forEach((label,i)=>{
    ctx.fillStyle = colors[i];
    ctx.fillRect(450,50+(i*36),18,18);

    ctx.fillStyle = "#111827";
    ctx.font = "14px Arial";

    const ratio = ((values[i]/total)*100).toFixed(1);

    ctx.fillText(
      `${label} (${ratio}%)`,
      480,
      64+(i*36)
    );
  });
}
