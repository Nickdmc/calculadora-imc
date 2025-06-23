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

  logoutBtn.addEventListener("click", function () {
    usuarioAtual = null;
    appContainer.style.display = "none";
    loginContainer.style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    resultadoDiv.innerHTML = "";
    if (chart) chart.destroy();
  });

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
      alert("Preencha todos os campos.");
      return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    const imcArredondado = imc.toFixed(2);

    const { classificacao, cor, orientacao } = obterClassificacaoOrientacao(imc);

    const novoRegistro = {
      data,
      peso,
      alturaCm,
      imc: imcArredondado,
      classificacao,
      cor,
      orientacao
    };

    const historico = JSON.parse(localStorage.getItem("historicoIMC_" + usuarioAtual)) || [];
    const existe = historico.some((item) =>
      item.data === novoRegistro.data &&
      item.peso === novoRegistro.peso &&
      item.alturaCm === novoRegistro.alturaCm &&
      item.imc === novoRegistro.imc
    );

    if (!existe) {
      historico.push(novoRegistro);
      localStorage.setItem("historicoIMC_" + usuarioAtual, JSON.stringify(historico));
    }

    exibirHistorico();
  });

  function obterClassificacaoOrientacao(imc) {
    if (imc < 18.5) {
      return { classificacao: "Abaixo do peso", cor: "blue", orientacao: "Considere aumentar a ingestão calórica com alimentos nutritivos. Consulte um nutricionista." };
    } else if (imc < 25) {
      return { classificacao: "Peso normal", cor: "green", orientacao: "Parabéns! Mantenha uma alimentação equilibrada e pratique exercícios regularmente." };
    } else if (imc < 30) {
      return { classificacao: "Sobrepeso", cor: "orange", orientacao: "Considere adotar uma dieta balanceada e aumentar a atividade física." };
    } else if (imc < 35) {
      return { classificacao: "Obesidade Grau I", cor: "orangered", orientacao: "É importante buscar orientação médica e nutricional." };
    } else if (imc < 40) {
      return { classificacao: "Obesidade Grau II", cor: "red", orientacao: "Recomenda-se acompanhamento médico especializado." };
    } else {
      return { classificacao: "Obesidade Grau III", cor: "darkred", orientacao: "É fundamental buscar acompanhamento médico imediato." };
    }
  }

  function exibirHistorico() {
    resultadoDiv.innerHTML = "";
    const historico = JSON.parse(localStorage.getItem("historicoIMC_" + usuarioAtual)) || [];
    if (historico.length === 0) {
      atualizarGrafico([], []);
      return;
    }

    const container = document.createElement("div");
    const botoes = document.createElement("div");
    botoes.className = "botoes-historico";
    botoes.innerHTML = `
      <button id="removerUltimo" class="btn-limpar">Remover último</button>
      <button id="limparTudo" class="btn-limpar">🧹 Limpar Histórico</button>
    `;
    container.appendChild(botoes);

    historico.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "card-historico";
      card.innerHTML = `
        <div><strong>Data:</strong> ${formatarData(item.data)}</div>
        <div><strong>Peso:</strong> ${item.peso} kg</div>
        <div><strong>Altura:</strong> ${item.alturaCm} cm</div>
        <div><strong>IMC:</strong> ${item.imc}</div>
        <div><strong>Classificação:</strong> <span style="color:${item.cor}; font-weight:bold">${item.classificacao}</span></div>
        <div class="orientacao"><strong>💡 Orientação:</strong> ${item.orientacao}</div>
      `;
      container.appendChild(card);
    });

    resultadoDiv.appendChild(container);

    document.getElementById("removerUltimo").addEventListener("click", () => {
      historico.pop();
      localStorage.setItem("historicoIMC_" + usuarioAtual, JSON.stringify(historico));
      exibirHistorico();
    });

    document.getElementById("limparTudo").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
        localStorage.removeItem("historicoIMC_" + usuarioAtual);
        exibirHistorico();
      }
    });

    const labels = historico.map(item => formatarData(item.data));
    const dadosIMC = historico.map(item => parseFloat(item.imc));
    atualizarGrafico(labels, dadosIMC);
  }

  function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia); // mês começa em 0 no JavaScript
  return data.toLocaleDateString("pt-BR");
}


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