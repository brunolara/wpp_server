export default interface Client{
    socketId: string,
    UsuarioId: number,
    NomeUsuario: string,
    EmailUsuario: string,
    EstabelecimentoId: number,
    NomeEstabelecimento: string,
    RazaoSocialEstabelecimento: string,
    Permissoes: string[],
}
