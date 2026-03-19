Api::Application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  resources :boards do
    resources :lists, only: [:create, :destroy]
  end

  resources :lists, only: [:update, :destroy] do
    resources :cards, only: [:create]
  end

  resources :cards, only: [:index, :show, :update, :destroy] do
    resources :notes, only: [:create]
  end

  resources :working_memory_entries, only: [:index, :create, :update, :destroy] do
    collection do
      delete 'destroy_all'
    end
  end
end
