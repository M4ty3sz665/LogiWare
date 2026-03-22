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
namespace LogiWareAvalonia.ViewModels
{
    public partial class MainWindowViewModel : ViewModelBase
    {
        private ServerConnection _conn = new ServerConnection("http://localhost:3000");
        [ObservableProperty]
        private bool _isadminview;
        [ObservableProperty]
        private ObservableCollection<object> _currentItems = new();
        [ObservableProperty]
        private string _titleLabel = "Dashboard";
        [ObservableProperty]
        private ObservableCollection<User> _users = new(); 
        [ObservableProperty]
        private ObservableCollection<Stock> _stock = new();
        [ObservableProperty]
        private ObservableCollection<Order> _orders = new();
        private string ActiveWindow = "none";
        public AsyncRelayCommand UsersButtonClick { get; }
        public AsyncRelayCommand StockButtonClick { get; }
        public AsyncRelayCommand OrdersButtonClick { get; }
        public AsyncRelayCommand NewItemCommand { get; }
        public AsyncRelayCommand<Window> LogOutClick { get; }
        public MainWindowViewModel()
        {
            UsersButtonClick = new AsyncRelayCommand(OnUsersClick);
            StockButtonClick = new AsyncRelayCommand(OnStockClick);
            OrdersButtonClick = new AsyncRelayCommand(OnOrdersClick);
            NewItemCommand = new AsyncRelayCommand(NewItem);
            LogOutClick = new AsyncRelayCommand<Window>(LogOut);
        }
        private async Task OnUsersClick()
        {
            if(Isadminview)
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
        private void OpenEditWindow(object objectToEdit)
        {
            if (objectToEdit == null) return;
            // 1. Create the new window instance
            // 2. Pass the selected user data into its constructor
            var editWin = new EditUserWindow(objectToEdit);
            editWin.Show();
        }
        private async Task OnStockClick()
        {
            ActiveWindow = "stock";
            TitleLabel = "Inventory & Stock";
            CurrentItems.Clear();

            // Adding dummy data to CurrentItems so they appear on screen
            CurrentItems.Add(new Stock { product_name = "Alma", item_id = 1, amount = 10, created_at = DateOnly.FromDateTime(DateTime.Today) });
        }
        private async Task OnOrdersClick()
        {
            ActiveWindow = "orders";
            TitleLabel = "Orders Tracking";
            CurrentItems.Clear();

            // Add dummy orders to CurrentItems
            CurrentItems.Add(new Order { order_number = 1001, status = "TBD", payment_method = "Bank Transfer" });
            CurrentItems.Add(new Order { order_number = 1002, status = "Shipped", payment_method = "Credit Card" });
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
                EditUserWindow editWin = new EditUserWindow(newItem);
                editWin.Show();
            }
        }
        private async Task LogOut(Window? currentWindow)
        {
            Token.token = "";
            Token.IsAdmin = false;
            var msg = new MessageWindow("Are you sure?", "Confirmation");
            await msg.ShowDialog(currentWindow);
            if (Avalonia.Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                Window1 loginWin = new Window1();
                desktop.MainWindow = loginWin;
                currentWindow.Close();
            }
        }
    }
}
