let usuarioAtual = null;
let chart = null;

document.addEventListener("DOMContentLoaded", function () {
  const loginContainer = document.getElementById("loginContainer");
  const registerContainer = document.getElementById("registerContainer");
  const appContainer = document.getElementById("appContainer");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  const loginMsg = document.getElementById("loginMsg");
  const registerMsg = document.getElementById("registerMsg");
  const logoutBtn = document.getElementById("logoutBtn");
  const form = document.getElementById("imcForm");
  const resultadoDiv = document.getElementById("resultado");

  // Alternar entre login e cadastro
  showRegister.addEventListener("click", function (e) {
    e.preventDefault();
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  });
  showLogin.addEventListener("click", function (e) {
    e.preventDefault();
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // Cadastro
  registerBtn.addEventListener("click", function () {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    if (!username || !password) {
      registerMsg.textContent = "Preencha usuário e senha.";
      return;
    }
    let users = JSON.parse(localStorage.getItem("usuariosIMC")) || [];
    if (users.find(u => u.username === username)) {
      registerMsg.textContent = "Usuário já existe.";
      return;
    }
    users.push({ username, password });
    localStorage.setItem("usuariosIMC", JSON.stringify(users));
    registerMsg.textContent = "Cadastro realizado! Faça login.";
    setTimeout(() => {
      registerContainer.style.display = "none";
      loginContainer.style.display = "block";
      registerMsg.textContent = "";
    }, 1500);
  });

  // Login
  loginBtn.addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (!username || !password) {
      loginMsg.textContent = "Preencha usuário e senha.";
      return;
    }
    let users = JSON.parse(localStorage.getItem("usuariosIMC")) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      loginMsg.textContent = "Usuário ou senha inválidos.";
      return;
    }
    usuarioAtual = username;
    loginContainer.style.display = "none";
    appContainer.style.display = "block";
    exibirHistorico();
  });

  // Logout
  logoutBtn.addEventListener("click", function () {
    usuarioAtual = null;
    appContainer.style.display = "none";
    loginContainer.style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    resultadoDiv.innerHTML = "";
    if (chart) chart.destroy();
  });

  // Formulário de IMC
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!usuarioAtual) {
      alert("Faça login primeiro.");
      return;
    }

    const peso = parseFloat(document.getElementById("peso").value);
    const alturaCm = parseFloat(document.getElementById("altura").value);
    const data = document.getElementById("data").value;

    if (!peso || !alturaCm || !data) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    const imcArredondado = imc.toFixed(2);

    let classificacao = "";

    if (imc < 18.5) classificacao = "Abaixo do peso";
    else if (imc < 24.9) classificacao = "Peso normal";
    else if (imc < 29.9) classificacao = "Sobrepeso";
    else if (imc < 34.9) classificacao = "Obesidade Grau I";
    else if (imc < 39.9) classificacao = "Obesidade Grau II";
    else classificacao = "Obesidade Grau III";

    const novoRegistro = {
      data,
      peso,
      alturaCm,
      imc: imcArredondado,
      classificacao,
    };

    const historico = JSON.parse(localStorage.getItem("historicoIMC_" + usuarioAtual)) || [];

    // Evita duplicatas exatas
    const existe = historico.some(
      (item) =>
        item.data === novoRegistro.data &&
        item.peso === novoRegistro.peso &&
        item.alturaCm === novoRegistro.alturaCm &&
        item.imc === novoRegistro.imc
    );

    if (!existe) {
      historico.push(novoRegistro);
      localStorage.setItem("historicoIMC_" + usuarioAtual, JSON.stringify(historico));
    }

    exibirResultado(novoRegistro);
    exibirHistorico();
  });

  function exibirResultado(resultado) {
    resultadoDiv.innerHTML = `
      <p><strong>Data:</strong> ${formatarData(resultado.data)}</p>
      <p><strong>IMC:</strong> ${resultado.imc}</p>
      <p><strong>Classificação:</strong> ${resultado.classificacao}</p>
    `;
  }

  function exibirHistorico() {
    resultadoDiv.innerHTML = '';

    if (!usuarioAtual) return;

    const historico = JSON.parse(localStorage.getItem("historicoIMC_" + usuarioAtual)) || [];

    if (historico.length === 0) {
      resultadoDiv.innerHTML = '';
      atualizarGrafico([], []);
      return;
    }

    let tabela = `
      <h3>Histórico</h3>
      <div class="tabela-container">
        <table class="tabela-historico">
          <thead>
            <tr>
              <th>Data</th>
              <th>Peso</th>
              <th>Altura</th>
              <th>IMC</th>
              <th>Classificação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
    `;

    historico.forEach((item, index) => {
      tabela += `
        <tr>
          <td>${formatarData(item.data)}</td>
          <td>${item.peso} kg</td>
          <td>${item.alturaCm} cm</td>
          <td>${item.imc}</td>
          <td>${item.classificacao}</td>
          <td><button class="btn-excluir" data-index="${index}">🗑️</button></td>
        </tr>
      `;
    });

    tabela += `
         </tbody>
       </table>
     </div>
      <button id="limparTudo" class="btn-limpar">🧹 Limpar Histórico</button>
    `;

    resultadoDiv.innerHTML += tabela;

    // Eventos de exclusão
    document.querySelectorAll(".btn-excluir").forEach((botao) => {
      botao.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        historico.splice(index, 1);
        localStorage.setItem("historicoIMC_" + usuarioAtual, JSON.stringify(historico));
        exibirHistorico();
      });
    });

    // Botão limpar tudo
    document.getElementById("limparTudo").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
        localStorage.removeItem("historicoIMC_" + usuarioAtual);
        resultadoDiv.innerHTML = "";
        atualizarGrafico([], []);
      }
    });

    // Atualiza o gráfico
    const labels = historico.map(item => formatarData(item.data));
    const dadosIMC = historico.map(item => parseFloat(item.imc));
    atualizarGrafico(labels, dadosIMC);
  }

  function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR");
  }

  // Gráfico com Chart.js
  function atualizarGrafico(labels, dadosIMC) {
    const ctx = document.getElementById('graficoIMC').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'IMC',
          data: dadosIMC,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
          tension: 0.2,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'IMC' }
          },
          x: {
            title: { display: true, text: 'Data' }
          }
        }
      }
    });
  }
});