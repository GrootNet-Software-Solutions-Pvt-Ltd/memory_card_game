using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

public class Board
{
    private List<Card> _pieces = new List<Card>();
    public List<Card> Pieces
    {
        get { return _pieces; }
        set { _pieces = value; }
    }

    public Board()
    {
        int imgIndex = 1;
        for (int i = 1; i <= 20; i++)
        {
            if (IsOdd(i))
                _pieces.Add(new Card()
                {
                    Id = i,
                    Pair = i + 1,
                    Name = "card-" + i.ToString(),
                    Image = string.Format("/assets/content/img/{0}.png", imgIndex)
                });
            else
            {
                _pieces.Add(new Card()
                {
                    Id = i,
                    Pair = i - 1,
                    Name = "card-" + i.ToString(),
                    Image = string.Format("/assets/content/img/{0}.png", imgIndex)
                });
                imgIndex++;
            }
        }
        _pieces.Shuffle();

    }

    private bool IsOdd(int i)
    {
        return i % 2 != 0;
    }
}
public static class MyExtensions
{
    static readonly Random Random = new Random();
    public static void Shuffle<T>(this IList<T> list)
    {
        int n = list.Count;
        while (n > 1)
        {
            n--;
            var k = Random.Next(n + 1);
            T value = list[k];
            list[k] = list[n];
            list[n] = value;
        }
    }
}