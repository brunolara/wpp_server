enum TipoOperacao {
    BOLETO = 1,
    CARTAO_DEBITO = 2,
    CARTAO_CREDITO = 3,
    PIX = 4,
    DEPOSITO = 5,
    JUROS = 6,

    TRANSFERENCIA_EXTERNA_PIX = 7,
    TRANSFERENCIA_EXTERNA_TEDTEV = 11,

    TRANSFERENCIA_INTERNA = 8,
    PAGAMENTO_BOLETO = 9,
    PAGAMENTO_PIX = 10,

}
enum StatusTransacaoEnum {

    // PAGO
    PAGO = 2,
    BOLETO_LIQUIDADO_COMPENSADO = 3,
    FINALIZADO = 18,
    CONFIRMADO = 19,
    TRANSFERIDO = 16,
    AUTORIZADO = 6,

    // CANCELADO
    CANCELADO = 4,
    RECUSADO = 10,
    ESTORNADO = 8,
    AGUARDANDO_ESTORNO = 9,
    DEVOLVIDO = 11,
    SUSPENSO = 14,

    // EM PROCESSO
    EM_PROCESSO = 5,
    EM_DISPUTA = 15,
    AGUARDANDO_PAGAMENTO = 7,
    ANALISE = 12,
    REVISAO_PAGAMENTO = 13,
    NAO_PAGO = 17,
    BOLETO_REGISTRADO = 1,
}

interface IntegracaoDadosGerenciaNet{
    nomePessoa: string;
    banco: string;
    documento: string;
}

interface Transacao {
    id: number;
    valor: number;
    valorBruto: number;
    cotacao?: number;
    parcelas?: number;
    nomeCliente?: string;
    usuarioId: number;
    tipoOperacao?: TipoOperacao;
    creationDate?: Date;
    lastModified?: Date;
    usuarioEstornoNome?: string;
    integracaoDadosGN?: IntegracaoDadosGerenciaNet;
    vencimento?: Date;
    nossaCotacao?: number;
    statusTransacao: StatusTransacaoEnum;
}

function toIntegracaoDadosGN(input:any): IntegracaoDadosGerenciaNet | undefined{
    if(input == null || !input) return undefined;
    return {
        nomePessoa: input.NomePessoa,
        banco: input.Banco,
        documento: input.Documento
    }
}

function toTransacao(input:any): Transacao | null{
    if(input == null) return null;
    return {
        id: input.Id,
        valor: input.Valor,
        valorBruto: input.ValorBruto,
        cotacao: input.Cotacao,
        parcelas: input.Parcelas,
        nomeCliente: input.NomeCliente,
        usuarioId: input.UsuarioId,
        tipoOperacao: input.TipoOperacao,
        creationDate: input.CreationDate,
        lastModified: input.LastModified,
        usuarioEstornoNome: input.UsuarioEstornoNome,
        integracaoDadosGN: toIntegracaoDadosGN(input.IntegracaoDadosGN),
        vencimento: input.Vencimento,
        nossaCotacao: input.NossaCotacao,
        statusTransacao: input.StatusTransacao
    }
}

export {Transacao, StatusTransacaoEnum, toTransacao}
