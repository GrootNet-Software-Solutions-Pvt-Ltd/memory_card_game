using Microsoft.AspNetCore.SignalR;

public class GameHub : Hub<IGameHub>
{
    private readonly GameState _gameState;
    public GameHub(GameState gameState)
    {
        _gameState = gameState;
    }
    public async Task< bool> Join(string userName)
    {
        var player = _gameState.GetPlayer(userName);
        if (player != null)
        {
           await Clients.Caller.playerExists();
            return true;
        }

        player = _gameState.CreatePlayer(userName);
        player.ConnectionId = Context.ConnectionId;

        await Clients.Caller.playerJoined(player);

        return await StartGame(player);
    }

    private async Task<bool> StartGame(Player player)
    {
        if (player != null)
        {
            Player player2;
            var game = _gameState.FindGame(player, out player2);
            if (game != null)
            {
                await Clients.Group(player.Group).buildBoard(game);
                return true;
            }

            player2 = _gameState.GetNewOpponent(player);
            if (player2 == null)
            {
                await Clients.Caller.waitingList();
                return true;
            }

            game = _gameState.CreateGame(player, player2);
            game.WhosTurn = player.Id;

                await Clients.Group(player.Group).buildBoard(game);
            return true;
        }
        return false;
    }

    public async Task<bool> Flip(string cardName , string userName)
    {
        var player = _gameState.GetPlayer(userName);
        if (player != null)
        {
            Player playerOpponent;
            var game = _gameState.FindGame(player, out playerOpponent);
            if (game != null)
            {
                if (!string.IsNullOrEmpty(game.WhosTurn) && game.WhosTurn != player.Id)
                {
                    return true;
                }

                var card = FindCard(game, cardName);
                await Clients.Group(player.Group).flipCard(card);
                return true;
            }
        }
        return false;
    }

    private Card FindCard(Game game, string cardName)
    {
        return  game.Board.Pieces.FirstOrDefault(c => c.Name == cardName);
    }

    public async Task<bool> CheckCard(string cardName , string userName)
    {
        Player player = _gameState.GetPlayer(userName);
        if (player != null)
        {
            Player playerOpponent;
            Game game = _gameState.FindGame(player, out playerOpponent);
            if (game != null)
            {
                if (!string.IsNullOrEmpty(game.WhosTurn) && game.WhosTurn != player.Id)
                    return true;

                Card card = FindCard(game, cardName);

                if (game.LastCard == null)
                {
                    game.WhosTurn = player.Id;
                    game.LastCard = card;
                    return true;
                }

                //second flip

                bool isMatch = IsMatch(game, card);
                if (isMatch)
                {
                    StoreMatch(player, card);
                    game.LastCard = null;
                  await  Clients.Group(player.Group).showMatch(card, userName);

                    if (player.Matches.Count >= 12)
                    {
                        await Clients.Group(player.Group).winner(card, userName);
                        _gameState.ResetGame(game);
                        return true;
                    }

                    return true;
                }

                Player opponent = _gameState.GetOpponent(player, game);
                //shift to other player
                game.WhosTurn = opponent.Id;

                await Clients.Group(player.Group).resetFlip(game.LastCard, card);
                game.LastCard = null;
                return true;
            }
        }

        return false;
    }

    private void StoreMatch(Player player, Card card)
    {
        player.Matches.Add(card.Id);
        player.Matches.Add(card.Pair);
    }

    private bool IsMatch(Game game, Card card)
    {
        if (card == null)
            return false;

        if (game.LastCard != null)
        {
            if (game.LastCard.Pair == card.Id)
            {
                return true;
            }

            return false;
        }

        return false;
    }
}
