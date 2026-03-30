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
        readonly HttpClient client = new();
        readonly string serverUrl = "";
        public ServerConnection(string serverUrl) => this.serverUrl = serverUrl;

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
                    password
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                var loginData = JsonSerializer.Deserialize<LoginResponse>(result);
                if (loginData != null)
                {
                    Token.token = loginData.token;
                    Token.IsAdmin = loginData.admin;
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
                    newUser.name,
                    password = newUser.passsword,
                    newUser.phone,
                    newUser.role,
                    newUser.email,
                    admin = newUser.role.Equals("admin", StringComparison.CurrentCultureIgnoreCase)
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "Application/json");
                HttpResponseMessage response = await client.PostAsync(url, sendThis);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                User data = JsonSerializer.Deserialize<User>(result);
                new MessageWindow("User created Successfully", "Success").Show();
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
            List<User> all;
            string url = serverUrl + "/profiles";
            try
            {
                AddAuth();
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = [.. JsonSerializer.Deserialize<List<User>>(result)];
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return [];
            }
            return all;
        }
        public async Task<List<Stock>> GetStock()
        {
            List<Stock> all;
            string url = serverUrl + "/stock";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = [.. JsonSerializer.Deserialize<List<Stock>>(result)];
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return [];
            }
            return all;
        }
        public async Task<List<Product>> GetProducts()
        {
            List<Product> all;
            string url = serverUrl + "/product";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = [.. JsonSerializer.Deserialize<List<Product>>(result)];
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return [];
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
                    oneuser.id,
                    oneuser.name,
                    oneuser.email,
                    oneuser.phone,
                    password = oneuser.passsword,
                    oneuser.role
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
            string url = serverUrl + "/stock/" + onestock.id;
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    product_id = onestock.product_code,
                    onestock.amount,
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
                    product_id = oneStock.product_code,
                    type = "ADJUST",
                    oneStock.amount,
                    note = "",
                    time_of_movement = DateOnly.FromDateTime(DateTime.Now)
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
            List<Order> all;
            string url = serverUrl + "/order";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = [.. JsonSerializer.Deserialize<List<Order>>(result)];
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return [];
            }
            return all;
        }
        public async Task<List<OrderItem>> GetOrderItems()
        {
            List<OrderItem> all;
            string url = serverUrl + "/orderitem";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                all = [.. JsonSerializer.Deserialize<List<OrderItem>>(result)];
            }
            catch (Exception e)
            {
                new MessageWindow(e.Message, "Error").Show();
                return [];
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
                    oneorder.order_number,
                    oneorder.company_id,
                    oneorder.status,
                    oneorder.payment_status,
                    oneorder.payment_method,
                    oneorder.due_date,
                    oneorder.due_time
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
            string url = serverUrl + "/order";
            try
            {
                AddAuth();
                var jsonInfo = new
                {
                    oneOrder.payment_method,
                    oneOrder.due_date,
                    oneOrder.due_time,
                    oneOrder.payment_status,
                    oneOrder.company_id
                };
                string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "application/json");
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
                // Create a new product
                public async Task<bool> CreateProduct(Product newProduct)
                {
                    string url = serverUrl + "/product";
                    try
                    {
                        AddAuth();
                        var jsonInfo = new
                        {
                            newProduct.name,
                            newProduct.price_net,
                            newProduct.price_gross,
                            newProduct.vat_rate,
                            newProduct.supplier_id,
                            newProduct.low_stock_threshold
                        };
                        string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                        HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "application/json");
                        HttpResponseMessage response = await client.PostAsync(url, sendThis);
                        response.EnsureSuccessStatusCode();
                        return true;
                    }
                    catch (Exception e)
                    {
                        new MessageWindow(e.Message, "Product Create Error").Show();
                        return false;
                    }
                }

                // Edit an existing product
                public async Task<bool> EditProduct(Product product)
                {
                    string url = serverUrl + "/product/" + product.id;
                    try
                    {
                        AddAuth();
                        var jsonInfo = new
                        {
                            product.name,
                            product.price_net,
                            product.price_gross,
                            product.vat_rate,
                            product.supplier_id,
                            product.low_stock_threshold
                        };
                        string jsonStringified = JsonSerializer.Serialize(jsonInfo);
                        HttpContent sendThis = new StringContent(jsonStringified, Encoding.UTF8, "application/json");
                        HttpResponseMessage response = await client.PutAsync(url, sendThis);
                        response.EnsureSuccessStatusCode();
                        return true;
                    }
                    catch (Exception e)
                    {
                        new MessageWindow(e.Message, "Product Edit Error").Show();
                        return false;
                    }
                }

                // Get current user profile
                public async Task<User> GetCurrentUser()
                {
                    string url = serverUrl + "/oneuser";
                    try
                    {
                        AddAuth();
                        HttpResponseMessage response = await client.GetAsync(url);
                        response.EnsureSuccessStatusCode();
                        string result = await response.Content.ReadAsStringAsync();
                        return JsonSerializer.Deserialize<User>(result);
                    }
                    catch (Exception e)
                    {
                        new MessageWindow(e.Message, "Get User Error").Show();
                        return null;
                    }
                }
        }
    }



