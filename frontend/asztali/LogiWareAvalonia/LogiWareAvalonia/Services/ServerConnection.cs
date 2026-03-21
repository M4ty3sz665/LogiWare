using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Avalonia.Controls;
using LogiWareAvalonia.Classes;

namespace LogiWareAvalonia.Services
{
    class ServerConnection
    {
        HttpClient client = new HttpClient();
        string serverUrl = "";
        public ServerConnection(string serverUrl)
        {
            this.serverUrl = serverUrl;
        }

        public async Task<bool> Login(string username, string password)
        {
            string url = serverUrl + "/login";
            try
            {
                var jsonInfo = new
                {
                    loginUsername = username,
                    loginPassword = password
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                User data = JsonSerializer.Deserialize<User>(result);
                Token.token = data.token;
                return true;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return (false);
            }
        }
        public async Task<bool> Register(string username, string password)
        {
            string url = serverUrl + "/register";
            try
            {
                var jsonInfo = new
                {
                    registerUsername = username,
                    registerPassword = password
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                User data = JsonSerializer.Deserialize<User>(result);
                return true;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return (false);
            }
        }
        public async Task<List<User>> Profiles()
        {
            List<User> all = new List<User>();
            string url = serverUrl + "/profiles";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = JsonSerializer.Deserialize<List<User>>(result).ToList();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return new List<User>();
            }
            return all;
        }
        public async Task<List<Stock>> GetStock()
        {
            List<Stock> all = new List<Stock>();
            string url = serverUrl + "/stock";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = JsonSerializer.Deserialize<List<Stock>>(result).ToList();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return new List<Stock>();
            }
            return all;
        }
        public async Task<string> EditUser(User oneuser)
        {
            string url = serverUrl + "/oneuser";
            try
            {
                var jsonInfo = new
                {
                    id = oneuser.id,
                    name = oneuser.name,
                    email = oneuser.email,
                    phone = oneuser.phone,
                    password = oneuser.passsword,
                    role = oneuser.role
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PutAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                return result;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
            }
            return "Error";
        }
}
}


