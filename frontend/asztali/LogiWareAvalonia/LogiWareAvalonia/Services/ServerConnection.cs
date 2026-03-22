using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Numerics;
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
        public User ActiveUser;
        HttpClient client = new HttpClient();
        string serverUrl = "";
        public ServerConnection(string serverUrl)
        {
            this.serverUrl = serverUrl;
        }
        private void AddAuth()
        {
            client.DefaultRequestHeaders.Remove("Authorization");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", Token.token);
        }
        public async Task<bool> Login(string username, string password)
        {
            string url = serverUrl + "/login";
            try
            {
                var jsonInfo = new
                {
                    email = username,
                    password = password
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                var loginData = JsonSerializer.Deserialize<LoginResponse>(result);
                var loggeduser = JsonSerializer.Deserialize<User>(result);
                if (loginData != null)
                {
                    Token.token = loginData.token;
                    Token.IsAdmin = loggeduser.admin;
                    return true;
                }
                return false;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return (false);
            }
        }
        public async Task<bool> Register(User newUser)
        {
            string url = serverUrl + "/register";
            try
            {
                var jsonInfo = new
                {
                    name = newUser.name,
                    password = newUser.passsword,
                    phone = newUser.phone,
                    role = newUser.role,
                    email = newUser.email,
                    admin = newUser.role.ToLower() == "admin"
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
                AddAuth();
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
                AddAuth();
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
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
            }
            return "Error";
        }
        public async Task<string> EditStock(Stock onestock)
        {
            string url = serverUrl + "/onestock";
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    id = onestock.id,
                    product_name = onestock.product_name,
                    item_id = onestock.item_id,
                    amount = onestock.amount,
                    created_at = onestock.created_at
                };

                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PutAsync(url, sendThis);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Stock Update Error").Show();
                return "Error";
            }
        }
        public async Task<bool> CreateStock(Stock oneStock)
        {
            string url = serverUrl + "/stock";
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    item_id=oneStock.item_id,
                    amount=oneStock.amount,
                    created_at=DateOnly.FromDateTime(DateTime.Now)
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                return true;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return (false);
            }
        }
        public async Task<List<Order>> GetOrders()
        {
            List<Order> all = new List<Order>();
            string url = serverUrl + "/order";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = JsonSerializer.Deserialize<List<Order>>(result).ToList();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return new List<Order>();
            }
            return all;
        }
        public async Task<string> EditOrder(Order oneorder)
        {
            string url = serverUrl + "/order/"+oneorder.order_number;
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    order_number = oneorder.order_number,
                    item_id = oneorder.item_id,
                    company_id = oneorder.company_id,
                    status = oneorder.status,
                    payment_status = oneorder.payment_status,
                    payment_method = oneorder.payment_method,
                    due_date = oneorder.due_date,
                    due_time = oneorder.due_time
                };

                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PutAsync(url, sendThis);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Order Update Error").Show();
                return "Error";
            }
        }
        public async Task<bool> CreateOrder(Order oneOrder)
        {
            string url = serverUrl + "/stock";
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    item_id = oneOrder.company_id,
                    amount = oneOrder.due_date,
                    payment_method = oneOrder.payment_method,
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                return true;
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return (false);
            }
        }
    }
}


