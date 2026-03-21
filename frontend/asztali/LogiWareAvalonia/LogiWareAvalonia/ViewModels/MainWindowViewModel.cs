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
namespace LogiWareAvalonia.ViewModels
{
    public partial class MainWindowViewModel : ViewModelBase
    {
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
        public MainWindowViewModel()
        {
            UsersButtonClick = new AsyncRelayCommand(OnUsersClick);
            StockButtonClick = new AsyncRelayCommand(OnStockClick);
            OrdersButtonClick = new AsyncRelayCommand(OnOrdersClick);
        }
        private async Task OnUsersClick()
        {
            Users.Clear();            
            Users.Add(new User { name = "John Doe", email = "john@example.com", role = "Admin", phone = "123-456", joined_at = "2024-01-15" });
            Users.Add(new User { name = "Jane Smith", email = "jane@logiware.com", role = "Editor", phone = "987-654", joined_at = "2024-01-15" });
            Users.Add(new User { name = "Zoltán Kovács", email = "zoltan@test.hu", role = "User", phone = "555-0199", joined_at = "2024-01-15" });
            // 3. Optional: If you want to hide other views, you could set a 'CurrentView' property here
            // Console.WriteLine($"Loaded {Users.Count} dummy users.");
            await Task.CompletedTask;
            return;
        }
        [RelayCommand]
        private void OpenEditUser(User userToEdit)
        {
            // 1. Create the new window instance
            // 2. Pass the selected user data into its constructor
            var editWin = new EditUserWindow(userToEdit);

            // 3. Display the window to the user
            editWin.Show();
        }
        private async Task OnStockClick()
        {
            Users.Add(new User { name = "John Doe", email = "john@example.com", role = "Admin", phone = "123-456", joined_at = "2024-01-15" });

        }
        private async Task OnOrdersClick()
        {

        }
    }
}
