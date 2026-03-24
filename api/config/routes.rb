# frozen_string_literal: true

Api::Application.routes.draw do
  get 'up' => 'rails/health#show', as: :rails_health_check

  resources :boards do
    collection do
      get :archived
    end

    member do
      patch :archive
      patch :unarchive
    end

    resources :lists, only: %i[create destroy]
  end

  resources :lists, only: %i[update destroy] do
    resources :cards, only: %i[create]
  end

  resources :cards, only: %i[index show update destroy]

  resources :working_memory_entries, only: %i[index create update destroy] do
    collection do
      delete 'destroy_all'
    end
  end
end
