using Avalonia.Controls;
using CommunityToolkit.Mvvm.Input;
using LogiWareAvalonia.Classes;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LogiWareAvalonia.Views;
using CommunityToolkit.Mvvm.ComponentModel;
using Avalonia;
using LogiWareAvalonia.Services;
using Avalonia.Controls.ApplicationLifetimes;
using System.Data;
using Avalonia.Platform;
namespace LogiWareAvalonia.ViewModels
{
    public partial class MainWindowViewModel : ViewModelBase
    {
        private readonly ServerConnection _conn = new("http://localhost:3000");
        [ObservableProperty]
        private bool _isMobileView;
        [ObservableProperty]
        private bool _isadminview;
        [ObservableProperty]
        private ObservableCollection<object> _currentItems = [];
        [ObservableProperty]
        private string _titleLabel = "Dashboard";
        [ObservableProperty]
        private ObservableCollection<User> _users = []; 
        [ObservableProperty]
        private ObservableCollection<Stock> _stocklist = [];
        [ObservableProperty]
        private ObservableCollection<Order> _orders = [];
        [ObservableProperty]
        private ObservableCollection<OrderItem> _items = [];
        [ObservableProperty]
        private ObservableCollection<Product> _products = [];
        public string ActiveWindow = "none";
        public AsyncRelayCommand UsersButtonClick { get; }
        public AsyncRelayCommand StockButtonClick { get; }
        public AsyncRelayCommand OrdersButtonClick { get; }
        public AsyncRelayCommand ProductsButtonClick { get; }
        public AsyncRelayCommand NewItemCommand { get; }
        public AsyncRelayCommand<Window> LogOutClick { get; }
        public AsyncRelayCommand<object> EditCommand { get; }
        public AsyncRelayCommand<Order> ViewCommand { get; }
        public MainWindowViewModel()
        {
            Isadminview = Token.IsAdmin;
            UsersButtonClick = new AsyncRelayCommand(OnUsersClick);
            StockButtonClick = new AsyncRelayCommand(OnStockClick);
            OrdersButtonClick = new AsyncRelayCommand(OnOrdersClick);
            ProductsButtonClick = new AsyncRelayCommand(OnProductsClick);
            NewItemCommand = new AsyncRelayCommand(NewItem);
            LogOutClick = new AsyncRelayCommand<Window>(LogOut);
            EditCommand = new AsyncRelayCommand<object>(OpenEditWindow);
            ViewCommand = new AsyncRelayCommand<Order>(ViewOrders);
            InitializeData();
            if (OperatingSystem.IsWindows()) IsMobileView = true;
            else IsMobileView = true;
        }
        private async Task InitializeData()
        {
            var sers = await _conn.Profiles();
            Users = [.. sers];
            var items = await _conn.GetStock();
            Stocklist = [.. items];
            var prods = await _conn.GetProducts();
            Products = [.. prods];
            var orders = await _conn.GetOrders();
            Orders = [.. orders];
            var orderitems = await _conn.GetOrderItems();
            Items = [.. orderitems];
            foreach (var item in Items)
            {
                Product oneproduct = Products.FirstOrDefault(u => u.id == item.product_id);
                item.product = oneproduct;
            }
        }
        private async Task ViewOrders(Order order) 
        {
            if(order != null)
            {
                if (Avalonia.Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
                {
                    ViewOrderWindow win = new(order);
                    win.ShowDialog(desktop.MainWindow);
                }
            }
        }
        private async Task OnUsersClick()
        {
            if(Token.IsAdmin)
            {
                ActiveWindow = "users";
                TitleLabel = "User Management";
                CurrentItems.Clear();
                List<User> users = await _conn.Profiles();
                foreach (User item in users) CurrentItems.Add(item);
            }
            else new MessageWindow("Admin rights required", "Not authorized").Show();
        }
        [RelayCommand]
        private async Task OpenEditWindow(object objectToEdit)
        {
            if (objectToEdit == null) return;
            // 1. Create the new window instance
            // 2. Pass the selected user data into its constructor
            var editWin = new EditUserWindow(objectToEdit)
            {
                OnSaveCallBack = async () =>
                {
                    switch (ActiveWindow)
                    {
                        case "stock":
                            await OnStockClick();
                            break;
                        case "users":
                            await OnUsersClick();
                            break;
                        case "orders":
                            await OnOrdersClick();
                            break;
                    }
                }
            };
            editWin.Show();
        }
        private async Task OnStockClick()
        {
            ActiveWindow = "stock";
            TitleLabel = "Inventory & Stock";
            CurrentItems.Clear();
            var items = await _conn.GetStock();
            Stocklist = [.. items];
            foreach (var item in Stocklist) CurrentItems.Add(item);
        }
        private async Task OnOrdersClick()
        {
            ActiveWindow = "orders";
            TitleLabel = "Orders Tracking";
            CurrentItems.Clear();
            var get = await _conn.GetOrders();
            Orders = [.. get];
            foreach (var item in Orders)
            {
                User oneuser  = Users.FirstOrDefault(u => u.id == item.company_id);
                if (oneuser != null) item.company_name = oneuser.name;
                else item.company_name = "company not found";
                CurrentItems.Add(item);
            }

        }
        private async Task OnProductsClick()
        {
            CurrentItems.Clear();
            List<Product> ReqProducts = await _conn.GetProducts();
            foreach (var item in ReqProducts)
            {
                Products.Add(item);
                CurrentItems.Add(item);
            }
        }
        private async Task NewItem()
        {
            if(ActiveWindow!= "none")
            {
            object newItem = new();
            switch (ActiveWindow)
            {
                case "users":
                {
                    newItem = new User();
                    break;
                }
                case "stock":
                {
                    newItem = new Stock();
                    break;
                }
                case "orders":
                {
                    newItem = new Order();
                    break;
                }
            }
                EditUserWindow editWin = new(newItem);
                editWin.Show();
            }
        }
        private async Task LogOut(Window? currentWindow)
        {
            Token.token = "";
            Token.IsAdmin = false;
            //var msg = new MessageWindow("Are you sure?", "Confirmation");
            //await msg.ShowDialog(currentWindow);
            if (Avalonia.Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                Window1 loginWin = new();
                desktop.MainWindow = loginWin;
                await loginWin.ShowDialog(currentWindow);
                currentWindow.Close();
            }
        }
    }
}
