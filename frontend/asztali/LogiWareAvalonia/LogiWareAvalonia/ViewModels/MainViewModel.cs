using CommunityToolkit.Mvvm.ComponentModel;
namespace LogiWareAvalonia.ViewModels;

public partial class MainViewModel : ViewModelBase
{
[ObservableProperty]
    private ViewModelBase _currentPage;

    public MainViewModel()
    {
        // Start on the Login page
        var loginVM = new LoginViewModel();
        _currentPage = loginVM;
    }}
