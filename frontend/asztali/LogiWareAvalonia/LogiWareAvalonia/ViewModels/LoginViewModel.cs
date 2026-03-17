using CommunityToolkit.Mvvm.Input;
using LogiWareAvalonia.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.ViewModels
{
    public class LoginViewModel : ViewModelBase
    {
        ServerConnection conn = new ServerConnection("http://localhost:3000");
        private  string _username;
        private  string _password;
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
        public RelayCommand Login { get; }
        public LoginViewModel()
        {
            Login = new RelayCommand(OnLogin);
        }
        async void OnLogin()
        {
            if( await conn.Login(Username, Password))
            {
                var main = new Views.MainWindow();
                main.Show();
            }
        }
    }
}
