document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("imcForm");
  const resultadoDiv = document.getElementById("resultado");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

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

    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

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
      localStorage.setItem("historicoIMC", JSON.stringify(historico));
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
    
    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

   if (historico.length === 0) {
        resultadoDiv.innerHTML = '';
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
        localStorage.setItem("historicoIMC", JSON.stringify(historico));
        exibirHistorico();
      });
    });

    // Botão limpar tudo
    document.getElementById("limparTudo").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
        localStorage.removeItem("historicoIMC");
        resultadoDiv.innerHTML = "";
      }
    });
  }

  function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR");
  }

  // Exibe ao carregar
  exibirHistorico();
});
