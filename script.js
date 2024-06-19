async function generatePDF() {
    const { PDFDocument, rgb } = PDFLib;

    // Fetch the existing PDF
    const existingPdfBytes = await fetch('orcamento-vazio.pdf').then(res => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the first page of the document
    const page = pdfDoc.getPage(0);

    // Get form values
    const cliente = document.getElementById('cliente').value;
    const telefone = document.getElementById('telefone').value;
    const veiculo = document.getElementById('veiculo').value;
    const cor = document.getElementById('cor').value;
    const placa = document.getElementById('placa').value;
    const ano = document.getElementById('ano').value;
    const chassi = document.getElementById('chassi').value;
    const obs = document.getElementById('obs').value;
    const acrescimo = document.getElementById('acrescimo').value;
    const desconto = document.getElementById('desconto').value;
    const totalGeral = document.getElementById('total_geral').value;

    // Draw text on the PDF (customize the coordinates to fit your template)
    page.drawText(cliente, { x: 74, y: 679, size: 12, color: rgb(0, 0, 0) });
    page.drawText(telefone, { x: 74, y: 665, size: 12, color: rgb(0, 0, 0) });
    page.drawText(veiculo, { x: 74, y: 651, size: 12, color: rgb(0, 0, 0) });
    page.drawText(cor, { x: 74, y: 637, size: 12, color: rgb(0, 0, 0) });
    page.drawText(placa, { x: 226, y: 651, size: 12, color: rgb(0, 0, 0) });
    page.drawText(ano, { x: 368, y: 651, size: 12, color: rgb(0, 0, 0) });
    page.drawText(chassi, { x: 226, y: 665, size: 12, color: rgb(0, 0, 0) });
    page.drawText(obs, { x: 226, y: 637, size: 12, color: rgb(0, 0, 0) });

    const items = document.getElementsByClassName('item');
    let yPosition = 583;
    for (const item of items) {
        const qtdd = item.querySelector('.qtdd').value;
        const descricao = item.querySelector('.descricao').value;
        const precoUn = item.querySelector('.preco_un').value;
        const total = item.querySelector('.total').value;

        page.drawText(qtdd, { x: 33, y: yPosition, size: 12, color: rgb(0, 0, 0) });
        page.drawText(descricao, { x: 122, y: yPosition, size: 12, color: rgb(0, 0, 0) });
        page.drawText(precoUn, { x: 384, y: yPosition, size: 12, color: rgb(0, 0, 0) });
        page.drawText(total, { x: 473, y: yPosition, size: 12, color: rgb(0, 0, 0) });

        yPosition -= 14;
    }

    page.drawText(acrescimo, { x: 482, y: 157, size: 12, color: rgb(0, 0, 0) });
    page.drawText(desconto, { x: 482, y: 169, size: 12, color: rgb(0, 0, 0) });
    page.drawText(totalGeral, { x: 482, y: 140, size: 13, color: rgb(0, 0, 0) });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF document
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'filled_template.pdf';
    link.click();
}

// Função para calcular o total de cada item
function calculateItemTotal(item) {
    const qtdd = item.querySelector('.qtdd').value;
    const precoUn = item.querySelector('.preco_un').value;
    const totalField = item.querySelector('.total');
    const total = qtdd * precoUn;
    totalField.value = total.toFixed(2);
}

// Função para calcular o total geral
function calculateTotalGeral() {
    const items = document.getElementsByClassName('item');
    let totalGeral = 0;

    for (const item of items) {
        calculateItemTotal(item);  // Certifica-se de que o total do item está atualizado
        const total = parseFloat(item.querySelector('.total').value);
        totalGeral += total;
    }

    const acrescimo = parseFloat(document.getElementById('acrescimo').value) || 0;
    const desconto = parseFloat(document.getElementById('desconto').value) || 0;

    totalGeral += acrescimo - desconto;
    document.getElementById('total_geral').value = totalGeral.toFixed(2);
}

// Adicionar listeners para recalcular ao mudar valores
document.addEventListener('input', (event) => {
    if (event.target.matches('.qtdd') || event.target.matches('.preco_un')) {
        const item = event.target.closest('.item');
        calculateItemTotal(item);
        calculateTotalGeral();
    } else if (event.target.matches('#acrescimo') || event.target.matches('#desconto')) {
        calculateTotalGeral();
    }
});

// Modificar a função addItem para adicionar listeners aos novos itens
function addItem() {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.innerHTML = `
        <label>Quantidade: <input type="number" class="qtdd"></label>
        <label>Descrição: <input type="text" class="descricao"></label>
        <label>Preço Unitário: <input type="text" class="preco_un"></label>
        <label>Total: <input type="text" class="total" readonly></label><br>
    `;
    document.getElementById('itens').appendChild(itemDiv);
    itemDiv.querySelector('.qtdd').addEventListener('input', () => calculateItemTotal(itemDiv));
    itemDiv.querySelector('.preco_un').addEventListener('input', () => calculateItemTotal(itemDiv));
}

// Não esquecer de calcular o total geral quando a página carrega
window.addEventListener('DOMContentLoaded', () => calculateTotalGeral());
