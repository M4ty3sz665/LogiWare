using System.Threading.Tasks;
using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LogiWareAvalonia.Classes;
using LogiWareAvalonia.Services;

namespace LogiWareAvalonia.ViewModels
{
    public partial class EditUserWindowViewModel : ViewModelBase
    {
        private readonly int _userId;
        private readonly User _userReference;
        private readonly ServerConnection _conn = new("http://localhost:3000");

        [ObservableProperty] private string _name = string.Empty;
        [ObservableProperty] private string _email = string.Empty;
        [ObservableProperty] private string _phone = string.Empty;
        [ObservableProperty] private string _password = string.Empty;
        [ObservableProperty] private string _role = string.Empty;

        // Updated to include <Window> to accept the parameter from XAML
        public AsyncRelayCommand<Window> EditUserButtonClick { get; }

        public EditUserWindowViewModel(User user)
        {
            _userReference = user; // Store the local variable reference
            _userId = user.id;

            // Map the Model data to these Observable properties
            _userReference.name = Name;
            _userReference.email = Email;
            _userReference.phone = Phone;
            _userReference.passsword = Password;
            _userReference.role = Role;

            EditUserButtonClick = new AsyncRelayCommand<Window>(EditUser);
        }

        public EditUserWindowViewModel() : this(new User { name = "User" }) { }

        private async Task EditUser(Window window)
        {
            // 1. Update the local variable (the "baton")
            _userReference.name = Name;
            _userReference.email = Email;
            _userReference.phone = Phone;
            _userReference.passsword = Password;
            _userReference.role = Role;

            // 2. Prepare the object for the server
            User updatedUser = new User
            {
                id = _userId,
                name = Name,
                email = Email,
                phone = Phone,
                passsword = Password,
                role = Role
            };

            // 3. Send to server
            //string result = await _conn.EditUser(updatedUser);

            // 4. Show result and close window if successful
            //if (result != "Error")
            {
                // Close the window directly after saving
                window?.Close();
            }
            //else
            {
                // Use your existing MessageWindow to show errors
            //    await MessageWindow.Show(window, "Failed to update user on server.", "Update Error");
            }
        }
    }
}