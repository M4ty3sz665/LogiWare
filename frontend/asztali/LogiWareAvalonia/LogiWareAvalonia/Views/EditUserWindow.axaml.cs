using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;
using LogiWareAvalonia.Classes;
using LogiWareAvalonia.ViewModels;
using System;

namespace LogiWareAvalonia.Views
{
    public partial class EditUserWindow : Window
    {
        public Action OnSaveCallBack { get; set; }
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
        private void Savebutton_Click(object s, RoutedEventArgs e)
        {
            OnSaveCallBack.Invoke();
            this.Close();
        }
    }
}
