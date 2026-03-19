return if Rails.env.test?

# Truncate all tables, reset PK sequences, cascade to dependents
ActiveRecord::Base.connection.execute("TRUNCATE boards, lists, cards RESTART IDENTITY CASCADE")

board = Board.create!(title: "My Board")                    # id=1
list1 = board.lists.create!(title: "To Do", position: 0)   # id=1
list2 = board.lists.create!(title: "Done", position: 1)    # id=2
card1 = list1.cards.create!(title: "First task", position: 0)  # id=1

puts "Seed data created successfully!"
