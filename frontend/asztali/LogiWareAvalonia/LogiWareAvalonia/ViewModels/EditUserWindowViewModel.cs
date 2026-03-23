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

        private readonly ServerConnection _conn = new("http://localhost:3000");

        // This holds the actual object (User, Stock, or Order)
        [ObservableProperty]
        private object _editingItem;
        [ObservableProperty]
        private string _title;

        public AsyncRelayCommand<Window> SaveCommand { get; }

        public EditUserWindowViewModel(object item)
        {
            EditingItem = item;

            // Set window title based on the object type
            Title = EditingItem switch
            {
                User => "Edit User",
                Stock => "Edit Stock",
                Order => "Edit Order",
                _ => "Edit Item"
            };

            SaveCommand = new AsyncRelayCommand<Window>(Save);
        }

        private async Task Save(Window window)
        {
            string result = "Error";
            bool regresult = false;
            // Determine which API call to make based on the object type
            if (EditingItem is User u)
            {
                if (u.id != 0) result = await _conn.EditUser(u);
                else regresult = await _conn.Register(u);
                if (result != "Error" || regresult != false)
                {
                    window?.Close();
                }
            }
            else if (EditingItem is Stock s)
            {
                if (s.id != 0) result = await _conn.EditStock(s);
                else regresult = await _conn.CreateStock(s);
                if (result != "Error" || regresult != false)
                {
                    window?.Close();
                }
            }
            else if(EditingItem is Order o)
            {
                if (o.order_number != 0) result = await _conn.EditOrder(o);
                else regresult = await _conn.CreateOrder(o);
                if (result != "Error" || regresult != false)
                {
                    window?.Close();
                }
            }
        }
    }
}