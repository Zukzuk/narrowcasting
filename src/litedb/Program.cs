using System;
using System.IO;
using LiteDB;
using Newtonsoft.Json;

// TODO: Should be using the Playnite SDK for this

class Program
{
    static void Main(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("Usage: LiteDBReader <collectionName>");
            return;
        }

        string databasePath = "/app/library/games.db";  // Path to the LiteDB file
        string collectionName = args[0];                // Collection name from arguments
        string outputFile = $"/app/output/{collectionName}.json";

        try
        {
            using var db = new LiteDatabase(databasePath);
            var collection = db.GetCollection(collectionName);
            var documents = collection.FindAll();

            string json = JsonConvert.SerializeObject(documents, Formatting.Indented);
            File.WriteAllText(outputFile, json);

            Console.WriteLine($"Exported {collectionName} to {outputFile}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
