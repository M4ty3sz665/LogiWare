using System;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Controls;
using CommunityToolkit.Mvvm.Input;
using LogiWareAvalonia.Services;
using LogiWareAvalonia.Views;

namespace LogiWareAvalonia.ViewModels
{
    public partial class LoginViewModel : ViewModelBase
    {
        private readonly ServerConnection _conn = new ServerConnection("http://localhost:3000");
        // Initializing these to string.Empty fixes the "not null" error
        private string _username = string.Empty;
        private string _password = string.Empty;

        public string Username
        {
            get => _username;
            set
            {
                if (_username != value)
                {
                    _username = value;
                    OnPropertyChanged(nameof(Username));
                }
            }
        }

        public string Password
        {
            get => _password;
            set
            {
                if (_password != value)
                {
                    _password = value;
                    OnPropertyChanged(nameof(Password));
                }
            }
        }

        public  AsyncRelayCommand<Window> LoginCommand { get; }

        public LoginViewModel()
        {
            // We point directly to the method
            LoginCommand = new AsyncRelayCommand<Window>(OnLogin);
        }

        private async Task OnLogin(Window window)
        {
            if(await _conn.Login(Username, Password))
            {
            MainWindow main = new MainWindow();
            main.Show();
            window?.Close();
            }
            return;
        }
    }
}