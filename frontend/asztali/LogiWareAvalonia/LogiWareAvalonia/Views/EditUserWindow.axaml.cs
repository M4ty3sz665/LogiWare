using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using LogiWareAvalonia.Classes;
using LogiWareAvalonia.ViewModels;

namespace LogiWareAvalonia.Views
{
    public partial class EditUserWindow : Window
    {
        public EditUserWindow()
        {
            InitializeComponent();
        }

        // The constructor we built earlier for universal editing
        public EditUserWindow(object itemToEdit)
        {
            InitializeComponent();
            DataContext = new LogiWareAvalonia.ViewModels.EditUserWindowViewModel(itemToEdit);
        }
    }
}
